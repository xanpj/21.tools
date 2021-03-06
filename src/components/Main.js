import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import YouTube from 'react-youtube';
import { connect } from "react-redux";
import { actionSetToolContent,
        actionAddToolElement,
        actionDeleteToolElement,
        actionSetFlowInstance,
        actionSetToolboxHeader } from "../actions/flowActions";

import ToolBox from './ToolBox'
import ContextMenu from './ContextMenu'
import Spinner from './Spinner'
import NotFound from './NotFound'
import * as Serialization from './functionsSerialization'
import * as Positions from '../resources/InfographicPositions';
import * as Utils from '../utils'
import * as CONSTANTS from '../constants'

const CONTEXT_MENU = {
  ADD: "ADD",
}
class Main extends Component {

  constructor(props){
    super(props)

    this.onEditToolBox = this.onEditToolBox.bind(this)

    this.state = {
      allToolPageVersions: null,
      contentHashOnMount: null,
      toolPageMeta: null,
      flowInstance: null,
      videoInitialized: false,
      videoEvent: null,
      videoDuration: null,
      timecode: [],
      editMode: false,
      contextMenu: null,
      contextMenuCoords: null,
      contextMenuParam: null,
      addTextData: null,
      versionDropdown: false,
      toolsFromDB: null,
      toolsSelected: null,
      checkInterval: null,
      workflowsForToolbox: null,
      workflowData: null,
      toolboxData: null,
      contentNotFound: false,
      loading: false,
      bottombox: false
    }

    const toolContent = null

  }

  updateHighlightedLogo(currentTime) {
      console.log(currentTime);
  }

  setVideoIconHighlights(){
    // Get the <video> element with id="myVideo"

    /** Highlight all used icons **/

    //if(!this.state.videoInitialized){
      const state = this.state
      const timecode = state.timecode


      timecode.forEach((el, i) => {

        const logo_el = document.getElementById(el.id)


        if(logo_el){
          logo_el.classList.add("el-used")
        }
      })
  }

  componentDidUpdate(){
  }

  componentWillUnmount(){
    if(this.state.checkInterval){

      clearInterval(this.state.checkInterval)
    }
  }

  async componentDidMount(){

    if(this.state.toolPageMeta == null){
      var toolboxName = null;


      if(this.props.toolboxData){
        toolboxName = this.props.toolboxData.name
      } else if(this.props.workflowData) {
        toolboxName = this.props.workflowData.toolbox
      }
      await this.props.db.authenticateAnonymousUser()
      var toolPage;


      if(this.props.workflowData && this.props.workflowData.toolPageVersion){
          toolPage = await this.props.db.getSpecificToolPageVersion(toolboxName, this.props.workflowData.toolPageVersion.toString())
      } else {
          toolPage = await this.props.db.getLastToolPageVersion(toolboxName)
      }
        const allToolPageVersions = await this.props.db.getAllToolPageVersions(toolboxName)

        /** get similar workflows **/
        const workflowsForToolbox = await this.props.db.getWorkflowsForToolbox(toolboxName)
        console.log(workflowsForToolbox)
        /** END get similar workflows **/

        if(toolPage && toolPage.length > 0){
          const contentHashOnMount = Utils.md5(JSON.stringify(toolPage[0][CONSTANTS.SCHEMA_FIELD_TOOLS_DATA]) + "_" + JSON.stringify(toolPage[0][CONSTANTS.SCHEMA_FIELD_ANCHORS]))
          this.setState({
            workflowsForToolbox: workflowsForToolbox,
            workflowData: (this.props.workflowData) ? this.props.workflowData : null,
            timecode: (this.props.workflowData) ? this.props.workflowData.timecode : [],
            toolPageMeta: {
              name: toolPage[0][CONSTANTS.SCHEMA_FIELD_TOOL_PAGE],
              version: toolPage[0][CONSTANTS.SCHEMA_FIELD_VERSION],
            },
            allToolPageVersions: allToolPageVersions,
            contentHashOnMount: contentHashOnMount,
          })
          //TODO
          this.props.actionSetToolContent({
            toolContent: toolPage[0][CONSTANTS.SCHEMA_FIELD_TOOLS_DATA],
            toolConnections: toolPage[0][CONSTANTS.SCHEMA_FIELD_ANCHORS],
          })


          this.props.actionSetToolboxHeader(
            (this.props.toolboxData) ? toolPage[0][CONSTANTS.SCHEMA_FIELD_TOOL_PAGE] + " (toolbox)" : "How to do " + this.props.workflowData.videoTitle + " in the 21st century"
          )

      } else {
        this.setState({
          contentNotFound: true
        })
      }
    }
  }

  onEditToolBox() {
    this.setState({
                  editMode: !this.state.editMode,
                  contextMenu: null,
                  contextMenuCoords: null
                })
  }

  async publishToolBox(){
    if(this.state.editMode){
      alert("Please leave edit mode first")
    } else {

      const contentHashNow = Utils.md5(JSON.stringify(this.props.toolContent) + "_" + JSON.stringify(this.props.toolConnections))
      const contentChanged = contentHashNow !== this.state.contentHashOnMount

      var versionString = ""

      this.setState({loading: true})
      if(contentChanged) {
        //publishing starts
        const toolBoxElements = document.getElementsByClassName('tool-box-el')
        const serializedToolBoxElements = Serialization.serializeToolBoxElements(this.props.toolContent, toolBoxElements)

        const connections = this.props.flowInstance.getAllConnections()
        const anchors = connections.map(a => {
            return {id: a.id, anchor1: a.endpoints[0].anchor, anchor2: a.endpoints[1].anchor}
        });

        //determine which version number to put as name
        if(this.state.toolPageMeta && (this.state.toolPageMeta.version || this.state.toolPageMeta.version == 0)){
          const versionComponentsCurrent = this.state.toolPageMeta.version
          const currVersionArr = versionComponentsCurrent.toString().split("\.")
          if(this.state.allToolPageVersions.findIndex(el => {
            const elVersionArr = el.version.toString().split("\.")
            if(elVersionArr.length > 0 && currVersionArr.length > 0 && elVersionArr.length == currVersionArr.length){
              return parseInt(elVersionArr[elVersionArr.length - 1]) == parseInt(currVersionArr[currVersionArr.length-1]) + 1
            } else {
              return false
            }
          }) == -1) {
            if(currVersionArr.length == 1){
              versionString = parseInt(currVersionArr) + 1
            } else if(currVersionArr.length > 1){
              versionString = currVersionArr.slice(0, currVersionArr.length-1).join(".") + "." + (parseInt(currVersionArr[currVersionArr.length-1]) + 1)
            } else {
              versionString = "0"
            }
          } else {
            versionString = currVersionArr.join(".") + "." + "1"
          }
        }

        versionString = versionString.toString()
        const toolDataToDb = {
          [CONSTANTS.SCHEMA_FIELD_TOOL_PAGE]: this.state.toolPageMeta.name,
          [CONSTANTS.SCHEMA_FIELD_VERSION]: versionString,
          [CONSTANTS.SCHEMA_FIELD_TOOLS_DATA]: serializedToolBoxElements,
          [CONSTANTS.SCHEMA_FIELD_ANCHORS]: anchors,
        }

        await this.props.db.insertToolPageVersion(toolDataToDb)
        const allToolPageVersions = await this.props.db.getAllToolPageVersions(this.state.toolPageMeta.name)
        const contentHashNow = Utils.md5(JSON.stringify(this.props.toolContent) + "_" + JSON.stringify(this.props.toolConnections))


        this.setState({
          toolPageMeta: {
            name: this.state.toolPageMeta.name,
            version: versionString
          },
          allToolPageVersions: allToolPageVersions,
          contentHashOnMount: contentHashNow  //update contentHashOnMount
        })
        this.setState({loading: false})
      }
      if(this.props.workflowMode){
          //window relocation will occur, so no reset of loading state necessary
          this.props.submitWorkflow(this.state.timecode, versionString || this.state.toolPageMeta.version)
      }
    }
  }

  showContextMenu(e, param) {
    e.preventDefault();
    var left = e.pageX
    var top = e.pageY
    this.setState({contextMenuParam:param, contextMenu: CONTEXT_MENU.ADD, contextMenuCoords: [left, top, e.layerX, e.layerY]})
  }

  deleteElement(refId){
    this.props.actionDeleteToolElement(refId)
  }

  addTextOnChange(e){
    e.preventDefault();
    const text = e.target.value
    var addTextDataId = ""
    if(this.state.addTextData == null){
      addTextDataId = "text_" + Utils.uuidv4()
    } else {
      addTextDataId = this.state.addTextData.id
    }
    const pxOffsetFromContextMenu = 20
    const addTextData = {
      id: addTextDataId,
      left: this.state.contextMenuCoords[2] - pxOffsetFromContextMenu + "px",
      top: this.state.contextMenuCoords[3] - pxOffsetFromContextMenu + "px",
      content: text,
      type: "text",
      name: "",
      website: "",
      description:"",
    }
    this.setState({addTextData: addTextData})
  }

  onAddTextSubmit(){
    this.props.actionAddToolElement(this.state.addTextData)
    this.setState({
      contextMenu: null,
      contextMenuCoords: null,
      addTextData: null
    })
  }

  addGroup() {
    const addGroupDataId = "group_" + Utils.uuidv4()
    const pxOffsetFromContextMenu = 20
    const addGroupData = {
      id: addGroupDataId,
      width: 20,
      height: 20,
      left: this.state.contextMenuCoords[2] - pxOffsetFromContextMenu + "px",
      top: this.state.contextMenuCoords[3] - pxOffsetFromContextMenu + "px",
      content: "",
      name: "",
      website: "",
      description:"",
      type: "group"
    }
    this.props.actionAddToolElement(addGroupData)
    this.setState({
      contextMenu: null,
      contextMenuCoords: null,
    })
  }

  insertImgToDocument(formData, imgPreviewUrl){
    /** set tool_id to last_id + 1 **/
    const toolContent = this.props.toolContent
    const toolContentSorted = toolContent.filter(el => el.id.includes("logo")).sort(Utils.idSort)
    var lastId = 0
    if(toolContentSorted.length > 0){
      if(toolContentSorted[toolContentSorted.length-1].id.split("_").length > 2){
        lastId = parseInt(toolContentSorted[toolContentSorted.length-1].id.split("_")[1]) + 1
      } else {
        lastId = 20
      }
    }
    const addIconDataId = "logo_" + lastId + "_" +Utils.uuidv4()
    const pxOffsetFromContextMenu = 20

    const addIconData = {
      id: addIconDataId,
      width: 30,
      height: 30,
      left: this.state.contextMenuCoords[2] - pxOffsetFromContextMenu + "px",
      top: this.state.contextMenuCoords[3] - pxOffsetFromContextMenu + "px",
      content: imgPreviewUrl,
      name: formData.name || "",
      website: formData.website || "",
      description: formData.description || "",
      type: "img"
    }

    this.props.actionAddToolElement(addIconData)
    this.setState({
      contextMenu: null,
      contextMenuCoords: null,
    })
  }

  async changeToolPageVersion(toolPageId){
    const toolPage = await this.props.db.getSpecificToolPage(toolPageId)
    if(toolPage && toolPage.length > 0){
      this.props.actionSetToolContent({
        toolContent: null,
        toolConnections: null,
      })
      this.props.actionSetFlowInstance(null)
      this.props.actionSetToolContent({
        toolContent: toolPage[0][CONSTANTS.SCHEMA_FIELD_TOOLS_DATA],
        toolConnections: toolPage[0][CONSTANTS.SCHEMA_FIELD_ANCHORS]
      })
      const contentHashNow = Utils.md5(JSON.stringify(this.props.toolContent) + "_" + JSON.stringify(this.props.toolConnections))
      this.setState({
        toolPageMeta: {
          name: toolPage[0][CONSTANTS.SCHEMA_FIELD_TOOL_PAGE],
          version: toolPage[0][CONSTANTS.SCHEMA_FIELD_VERSION]
        },
        contentHashOnMount: contentHashNow
      })

      this.setVideoIconHighlights()
    }
  }

  async searchToolDatabase(toolName){
    const tools = await this.props.db.searchToolDatabase(toolName)
    this.setState({
      toolsFromDB: tools
    })
  }

  highlightUsedIcons(currentTime){
    const timecode = this.state.timecode
    const activeLogos = timecode.filter((el, i) => {
      let nextElementTime = this.state.videoDuration
      if(i < timecode.length-1){
        nextElementTime = timecode[i+1].time
      }
      const elDom = document.getElementById(el.id) //because this mounts before child component
      if(elDom){
        elDom.classList.remove("el-active")
      }
      return (currentTime > el.time && currentTime< nextElementTime)
    })
    if(activeLogos !== null && activeLogos.length > 0){
      const activeLogoId = activeLogos[0]
      const elDom = document.getElementById(activeLogoId.id)
      if(elDom){
        elDom.classList.add("el-active") //because this mounts before child component
      }
    }
  }

  toolSelected(elId){
    const timecode = this.state.timecode
    const event = this.state.videoEvent

    if(event && timecode){
      if(this.state.editMode){
          const newElement = {
            id: elId,
            time: event.target.getCurrentTime()
          }
          this.setState({timecode: [...timecode, newElement]}) //update timecode info
        }
      else {
        if(timecode.length > 0){
          const selectedEl = timecode.find(el => el.id === elId)
          if(selectedEl){
            this.state.videoEvent.target.seekTo(selectedEl.time) //skip to second
          }
        }
      }
    }
  }

  startInterval(event) {
     const self = this
     const checkInt = setInterval(function() {
       const currentTime = event.target.getCurrentTime()
       self.highlightUsedIcons(currentTime)
    }, 500)
    this.setState({checkInterval: checkInt})
 }

  _onReady(event){
    if(!this.state.videoDuration){
      this.setState({videoDuration: event.target.getDuration()})
    }
    if(event){
      this.startInterval(event)
      const currentTime = event.target.getCurrentTime()
      this.setState({videoEvent: event})
    }
  }

  renderWorkflowThumbnails(){
    if(!this.state.workflowsForToolbox){
      return ""
    } else {
      return this.state.workflowsForToolbox.map((el, i) =>
      <a href={"/"+btoa(unescape(encodeURIComponent(el[CONSTANTS.SCHEMA_FIELD_VIDEO_TITLE]))) + "-" + el[CONSTANTS.SCHEMA_FIELD_ID].toString()}>
        <li key={i} class="workflow-thumbnail">
          <div class="workflow-thumbnail-video"><img width="194" height="110" src={"https://img.youtube.com/vi/"+el[CONSTANTS.SCHEMA_FIELD_YOUTUBE_ID]+"/mqdefault.jpg"} /></div>
          <div class="workflow-thumbnail-title">{"How to do "+el[CONSTANTS.SCHEMA_FIELD_VIDEO_TITLE]+" in the 21st century"}</div>
          <div class="workflow-thumbnail-artist">{el[CONSTANTS.SCHEMA_FIELD_FULL_NAME]}</div>
        </li>
      </a>)
    }
  }

  render() {
    const contentHashOnMount = Utils.md5(JSON.stringify(this.props.toolContent) + "_" + JSON.stringify(this.props.toolConnections))
    const contentChanged = contentHashOnMount !== this.state.contentHashOnMount

    var versionOutput = "Toolbox"
    if(this.state.toolPageMeta){
      versionOutput = (this.state.toolPageMeta.name + " v" + this.state.toolPageMeta.version)
      if(versionOutput.length > 8){
        versionOutput = this.state.toolPageMeta.name.slice(0,3) + "... v" + this.state.toolPageMeta.version
      }
    }
    const ytOpts = {
      playerVars: { // https://developers.google.com/youtube/player_parameters
        autoplay: 0,
        rel: 0,
        showinfo: 0,
        ecver: 0,
        modestbranding: 0,
        enablejsapi: 1,
        controls: 1,
        color: 'white',
        iv_load_policy: 3,
        origin:'http://localhost:3000' //TODO
      }
    }


    return (
      <div className="Main" >
      {(this.state.contextMenu) ? <ContextMenu
        toolsFromDB = {this.state.toolsFromDB}
        searchToolDatabase = {(toolName) => this.searchToolDatabase(toolName)}
        insertImgToDocument = {(formData, imgPreviewUrl) => this.insertImgToDocument(formData, imgPreviewUrl)}
        editMode = {this.state.editMode}
        addGroup = {() => this.addGroup()}
        onAddTextSubmit={() => this.onAddTextSubmit()}
        addTextOnChange={(e) => this.addTextOnChange(e)}
        closeContextMenu={() => this.setState({contextMenu: null})}
        contextMenuParam={this.state.contextMenuParam}
        contextMenuCoords={this.state.contextMenuCoords}/> : ""}
        <div class="containerer">
          {(this.props.workflowData) ? (
          <div>
          <div className="left">
            <div className="middle-row">
              <div className="middle-col">

                <div className="video-box">
                  <div class="auto-resizable-iframe">
                      <YouTube
                       videoId={(this.props.workflowData) ? this.props.workflowData.youtubeId : "" }
                       opts={ytOpts}
                       onReady={(e) => this._onReady(e)} />
                  </div>
                </div>

                </div>
              </div>
            </div>

            <div className="right">
              <div className="splitter" />
            </div>
          </div>) : ""}

            <div className={(this.props.workflowData) ? "right" : "full right"}>
              <div className={(this.props.workflowData) ? "tool-box" : "tool-box full"}>
                {(!this.props.toolContent) ? "" : (
                <div id="edit-tool-box">
                  <div id="menuBtn" onClick={() => this.props.backToMenu()}><i class="fas fa-arrow-circle-left"></i>Menu</div>
                    {(!this.state.contentNotFound && (contentChanged || this.props.workflowMode )) ? (<button type="button" class={this.props.workflowMode ? "btn btn-success" : "btn btn-primary"} onClick={this.publishToolBox.bind(this)}>{this.props.workflowMode ? "Submit" : "Publish"}</button>) : ""}
                    <button type="button" class="btn btn-light" onClick={this.onEditToolBox.bind(this)}>{(this.state.editMode) ?  <img width="18" height="15" src="spinner-ripple.svg" /> : <i class="far fa-edit"></i>}</button>
                    <div class="dropdown">
                      <button class="btn btn-secondary dropdown-toggle" type="button" onClick={() => this.setState({versionDropdown: !this.state.versionDropdown}) } id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        {versionOutput}
                      </button>
                      <div class={this.state.versionDropdown ? "dropdown-menu dropdown-menu-toolbox open" : "dropdown-menu closed"} aria-labelledby="dropdownMenu2">
                        {(this.state.allToolPageVersions) ? this.state.allToolPageVersions.map((el, i) =>
                          <button class="dropdown-item" onClick={() => this.changeToolPageVersion(el._id)} type="button">
                          {this.state.toolPageMeta.name + " (toolbox) v" + el.version}</button>
                        ) : ""/*_id.getTimestamp().toLocaleString()*/}
                      </div>
                    </div>
                    {
                    (this.props.workflowMode) ?
                    <a href={CONSTANTS.VIDEO_WORKFLOW_SUBMIT_TUTORIAL} target="_blank"><small>How to submit the workflow?</small></a>
                    :
                    <a href={CONSTANTS.VIDEO_TOOLBOX_EDIT_TUTORIAL} target="_blank"><small>How to edit the toolbox?</small></a>
                    }
                </div>)}
                <div id="ToolBoxWrapper">
                {(this.props.toolContent !== null && !this.state.loading) ?
                  (<ToolBox
                  toolboxMode = {this.props.toolboxData ? true : false}
                  workflowMode={this.props.workflowMode}
                  toolSelected={(elId) => this.toolSelected(elId)}
                  setVideoIconHighlights={() => this.setVideoIconHighlights()}
                  addTextData={this.state.addTextData}
                  editMode={this.state.editMode}
                  deleteElement={(refId) => this.deleteElement(refId)}
                  showContextMenu={(e, param) => this.showContextMenu(e, param)}
                  />) : (this.props.workflowNotFound || this.state.contentNotFound) ? <NotFound /> :  <Spinner view={CONSTANTS.VIEWS.TOOLBOX} />}
                </div>
              </div>
            </div>

        </div>
        <div id="MainBottom" class={(this.state.bottombox) ? "high" : "low"}>
          <div class="main-bottom-header">
            <button onClick={() => this.setState({bottombox: !this.state.bottombox})} class="main-bottom-button menu-btn">
              <span>{this.props.toolboxData ? "Workflows using this toolbox" : "Similar workflows"}</span>
              <i class="fas fa-arrow-alt-circle-up"></i>
              </button>
            </div>
          {(this.state.bottombox) ? (<div class="main-bottom-box-wrapper">
            <ul class="main-bottom-box">
              {this.renderWorkflowThumbnails()}
            </ul>
          </div>) : ""}
        </div>
      </div>
    );
  }
}


const mapStateToProps = state => ({
  ...state
});
const mapDispatchToProps = dispatch => ({
  actionSetFlowInstance: (payload) => dispatch(actionSetFlowInstance(payload)),
  actionDeleteToolElement: (payload) => dispatch(actionDeleteToolElement(payload)),
  actionSetToolContent: (payload) => dispatch(actionSetToolContent(payload)),
  actionAddToolElement: (payload) => dispatch(actionAddToolElement(payload)),
  actionSetToolboxHeader: (payload) => dispatch(actionSetToolboxHeader(payload))
});
export default connect(mapStateToProps, mapDispatchToProps)(Main);
