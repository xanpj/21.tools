import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import YouTube from 'react-youtube';
import { connect } from "react-redux";
import { actionSetToolContent, actionAddToolElement, actionDeleteToolElement, actionSetFlowInstance} from "../actions/flowActions";

import ToolBox from './ToolBox'
import ContextMenu from './ContextMenu'
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
      timecode: [],
      editMode: false,
      contextMenu: null,
      contextMenuCoords: null,
      addTextData: null,
      versionDropdown: false,
      toolsFromDB: null,
      videoDuration: null,
      toolsSelected: null,
      checkInterval: null
    }

    const toolContent = null

  }

  updateHighlightedLogo(currentTime) {
      console.log(currentTime);
  }

  setVideoIconHighlights(){
    // Get the <video> element with id="myVideo"

    /** Highlight all used icons **/
    console.log("setVideoIconHighlights")
    //if(!this.state.videoInitialized){
      const state = this.state
      const timecode = state.timecode
      console.log("timecode")
      console.log(timecode)
      timecode.forEach((el, i) => {
        console.log(el.id)
        const logo_el = document.getElementById(el.id)
        console.log("logo_el")
        console.log(logo_el)
        if(logo_el){
          logo_el.classList.add("el-used")
        }
      })
  }

  componentDidUpdate(){
  }

  componentWillUnmount(){
    if(this.state.checkInterval){
      console.log("unmounted")
      clearInterval(this.state.checkInterval)
    }
  }

  async componentDidMount(){
    if(this.state.toolPageMeta == null){
      const TOOL_PAGE_NAME = "video"
      await this.props.db.authenticateAnonymousUser()
      const toolPage = await this.props.db.getLastToolPageVersion(TOOL_PAGE_NAME)
      console.log("toolPage main")
      console.log(toolPage)
      const allToolPageVersions = await this.props.db.getAllToolPageVersions(TOOL_PAGE_NAME)

      if(toolPage && toolPage.length > 0){
        const contentHashOnMount = Utils.md5(JSON.stringify(toolPage[0][CONSTANTS.SCHEMA_FIELD_TOOLS_DATA] + "_" + toolPage[0][CONSTANTS.SCHEMA_FIELD_ANCHORS]))
        this.setState({
          contentHashOnMount: contentHashOnMount,
          toolPageMeta: {
            name: toolPage[0][CONSTANTS.SCHEMA_FIELD_TOOL_PAGE],
            version: toolPage[0][CONSTANTS.SCHEMA_FIELD_VERSION],
            videoDuration: null,
          },
          allToolPageVersions: allToolPageVersions
        })

        this.props.actionSetToolContent({
          toolContent: toolPage[0][CONSTANTS.SCHEMA_FIELD_TOOLS_DATA],
          toolConnections: toolPage[0][CONSTANTS.SCHEMA_FIELD_ANCHORS],
        })

        console.log("MONGODB: pages")
        const pages = await this.props.db.getPages()
        console.log(pages)
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
      const contentHashOnMount = Utils.md5(JSON.stringify(this.props.toolContent + "_" + this.props.toolConnections))
      const contentChanged = contentHashOnMount !== this.state.contentHashOnMount

      var versionString = ""
      if(contentChanged) {
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
        console.log("versionString")
        console.log(versionString)

        const toolDataToDb = {
          [CONSTANTS.SCHEMA_FIELD_TOOL_PAGE]: this.state.toolPageMeta.name,
          [CONSTANTS.SCHEMA_FIELD_VERSION]: versionString.toString(),
          [CONSTANTS.SCHEMA_FIELD_TOOLS_DATA]: serializedToolBoxElements,
          [CONSTANTS.SCHEMA_FIELD_ANCHORS]: anchors,
        }

        await this.props.db.insertToolPageVersion(toolDataToDb)
        const allToolPageVersions = await this.props.db.getAllToolPageVersions(this.state.toolPageMeta.name)
        this.setState({
          toolPageMeta: {
            name: this.state.toolPageMeta.name,
            version: versionString
          },
          allToolPageVersions: allToolPageVersions
        })
      }
      if(this.props.workflowMode){
          this.props.submitWorkflow(this.state.timecode, versionString || this.state.toolPageMeta.version)
      }
    }
  }

  showContextMenu(e) {
    e.preventDefault();
    var left = e.pageX
    var top = e.pageY
    this.setState({contextMenu: CONTEXT_MENU.ADD, contextMenuCoords: [left, top, e.layerX, e.layerY]})
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
    console.log(addIconData)
    this.props.actionAddToolElement(addIconData)
    this.setState({
      contextMenu: null,
      contextMenuCoords: null,
    })
  }

  async changeToolPageVersion(toolPageId){
    const toolPage = await this.props.db.getSpecificToolPageVersion(toolPageId)
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

      this.setState({
        toolPageMeta: {
          name: toolPage[0][CONSTANTS.SCHEMA_FIELD_TOOL_PAGE],
          version: toolPage[0][CONSTANTS.SCHEMA_FIELD_VERSION]
        }
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
      return (currentTime> el.time && currentTime< nextElementTime)
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
    const event = this.state.videoEvent
    const timecode = this.state.timecode
    if(event && timecode){
      const newElement = {
        id: elId,
        time: event.target.getCurrentTime()
      }
      this.setState({timecode: [...timecode, newElement]})
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
    console.log(event)
    if(!this.state.videoDuration){
      this.setState({videoDuration: event.target.getDuration()})
    }
    if(event){
      this.startInterval(event)
      const currentTime = event.target.getCurrentTime()
      this.setState({videoEvent: event})
    }
  }

  render() {
    /*var video = document.createElement('video-player');
    var curtime = video.currentTime;*/
    var versionOutput = "Versions"
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
        contextMenuCoords={this.state.contextMenuCoords}/> : ""}
        <div class="containerer">
          <div className="left">
            <div className="middle-row">
              <div className="middle-col">

                <div className="video-box">
                  <div class="auto-resizable-iframe">
                      <YouTube
                       videoId="9rDhY1P3YLA"
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

            <div className="right">
              <div className="tool-box">
                <div id="edit-tool-box">
                <div id="menuBtn" onClick={() => this.props.backToMenu()}><i class="fas fa-arrow-circle-left"></i>Menu</div>
                  <button type="button" class={this.props.workflowMode ? "btn btn-success" : "btn btn-primary"} onClick={this.publishToolBox.bind(this)}>{this.props.workflowMode ? "Submit" : "Publish"}</button>
                  <button type="button" class="btn btn-light" onClick={this.onEditToolBox.bind(this)}><i class="far fa-edit"></i></button>
                  <div class="dropdown">
                  <button class="btn btn-secondary dropdown-toggle" type="button" onClick={() => this.setState({versionDropdown: !this.state.versionDropdown}) } id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    {versionOutput}
                  </button>
                  <div class={this.state.versionDropdown ? "dropdown-menu open" : "dropdown-menu closed"} aria-labelledby="dropdownMenu2">
                    {(this.state.allToolPageVersions) ? this.state.allToolPageVersions.map((el, i) =>
                      <button class="dropdown-item" onClick={() => this.changeToolPageVersion(el._id)} type="button">
                      {this.state.toolPageMeta.name + " v" + el.version}</button>
                    ) : ""/*_id.getTimestamp().toLocaleString()*/}
                  </div>
                </div>
                </div>
                <div id="ToolBoxWrapper">
                {(this.props.toolContent !== null) ?
                  (<ToolBox
                  workflowMode={this.props.workflowMode}
                  toolSelected={(elId) => this.toolSelected(elId)}
                  setVideoIconHighlights={() => this.setVideoIconHighlights()}
                  addTextData={this.state.addTextData}
                  editMode={this.state.editMode}
                  deleteElement={(refId) => this.deleteElement(refId)}
                  showContextMenu={e => this.showContextMenu(e)}
                  />) : "Loading"}
                </div>
              </div>
            </div>

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
  actionAddToolElement: (payload) => dispatch(actionAddToolElement(payload))
});
export default connect(mapStateToProps, mapDispatchToProps)(Main);
