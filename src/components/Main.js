import React, { Component } from 'react';
import { connect } from "react-redux";
import { actionSetToolContent, actionAddToolElement, actionDeleteToolElement} from "../actions/flowActions";

import ToolBox from './ToolBox'
import ContextMenu from './ContextMenu'
import * as Serialization from './functionsSerialization'
import * as Positions from '../resources/InfographicPositions';
import * as Utils from '../utils'

const CONTEXT_MENU = {
  ADD: "ADD",
}
class Main extends Component {

  constructor(props){
    super(props)

    this.onEditToolBox = this.onEditToolBox.bind(this)

    this.state ={
      flowInstance: null,
      videoInitialized: false,
      timecode: Positions.filmTimecode,
      editMode: false,
      contextMenu: null,
      contextMenuCoords: null,
      addTextData: null,
    }

    const toolContent = Positions.filmPositions
    this.props.actionSetToolContent(toolContent)

  }

  updateHighlightedLogo(currentTime) {
      console.log(currentTime);
  }

  componentDidUpdate(){
  }

  componentDidMount(){
    // Get the <video> element with id="myVideo"

    const state = this.state
    if(!this.state.videoInitialized){
      this.state.timecode.forEach((el, i) => {
        const logo_el = document.getElementById(el.id)
        if(logo_el){
          logo_el.classList.add("el-used")
        }
      })

      var vid = document.getElementById("video-player");
      vid.ontimeupdate = function() {
        const timecode = state.timecode
        const activeLogos = timecode.filter((el, i) => {
          let nextElementTime = vid.duration
          if(i < timecode.length-1){
            nextElementTime = timecode[i+1].time
          }
          document.getElementById(el.id).classList.remove("el-active")
          return (vid.currentTime > el.time && vid.currentTime < nextElementTime)
        })
        if(activeLogos !== null && activeLogos.length > 0){
          console.log(activeLogos)
          const activeLogoId = activeLogos[0]
          document.getElementById(activeLogoId.id).classList.add("el-active")
        }
        console.log(vid.currentTime);
      };
      this.state.videoInitialized = true
   }
  }

  onEditToolBox() {
    this.setState({editMode: !this.state.editMode})
  }

  publishToolBox(){
    const toolBoxElements = document.getElementsByClassName('tool-box-el')
    const serializedToolBoxElements = Serialization.serializeToolBoxElements(this.props.toolContent, toolBoxElements)

    const connections = this.props.flowInstance.getAllConnections()
    const anchors = connections.map(a => {
        return {id: a.id, anchor1: a.endpoints[0].anchor, anchor2: a.endpoints[1].anchor}
    });
    console.log("anchors")
    console.log(anchors)
  }

  showContextMenu(e) {
      e.preventDefault();
      var left = e.pageX
      var top = e.pageY
      alert(this.state.contextMenu)
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
      outer: "",
      type: "text"
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
      outer: "",
      type: "group"
    }
    this.props.actionAddToolElement(addGroupData)
    this.setState({
      contextMenu: null,
      contextMenuCoords: null,
    })
  }

  render() {
    /*var video = document.createElement('video-player');
    var curtime = video.currentTime;*/
    return (

      <div className="Main">
      {(this.state.contextMenu) ? <ContextMenu
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
                  <video id="video-player" controls>
                    <source src={require("../resources/SampleVideo_1280x720_20mb.mp4")} type="video/mp4" />
                    <source src="mov_bbb.ogg" type="video/ogg" />
                    Your browser does not support HTML5 video.
                  </video>
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
                  <button type="button" class="btn btn-primary" onClick={this.publishToolBox.bind(this)}>Publish</button>
                  <button type="button" class="btn btn-light" onClick={this.onEditToolBox.bind(this)}><i class="far fa-edit"></i></button>
                  <div class="dropdown">
                  <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Versions
                  </button>
                  <div class="dropdown-menu" aria-labelledby="dropdownMenu2">
                    <button class="dropdown-item" type="button">Action</button>
                    <button class="dropdown-item" type="button">Another action</button>
                    <button class="dropdown-item" type="button">Something else here</button>
                  </div>
                </div>
                </div>
                <div id="ToolBoxWrapper">
                  <ToolBox addTextData={this.state.addTextData}
                  editMode={this.state.editMode}
                  deleteElement={(refId) => this.deleteElement(refId)}
                  showContextMenu={e => this.showContextMenu(e)}
                  />
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
  actionDeleteToolElement: (payload) => dispatch(actionDeleteToolElement(payload)),
  actionSetToolContent: (payload) => dispatch(actionSetToolContent(payload)),
  actionAddToolElement: (payload) => dispatch(actionAddToolElement(payload))
});
export default connect(mapStateToProps, mapDispatchToProps)(Main);
