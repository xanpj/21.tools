import React, { Component } from 'react';
import { connect } from "react-redux";
import { actionSetFlowInstance } from "../actions/flowActions";

import ToolBox from './ToolBox'
import * as Positions from '../resources/InfographicPositions';

class Main extends Component {

  constructor(props){
    super(props)

    this.onEditToolBox = this.onEditToolBox.bind(this)

    this.state ={
      videoInitialized: false,
      timecode: Positions.filmTimecode,
      editMode: false,
      contextMenu: false,
      contextMenuCoords: null,
      flowInstance: null
    }

  }

  updateHighlightedLogo(currentTime) {
      console.log(currentTime);
  }

  componentDidUpdate(){
    console.log("this.state")
    console.log(this.state)
    console.log("this.props")
    console.log(this.props)

  }

  componentDidMount(){
    // Get the <video> element with id="myVideo"
    const state = this.state
    if(!this.state.videoInitialized){
      this.state.timecode.forEach((el, i) => document.getElementById(el.id).classList.add("el-used"))

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
    const toolBoxElementsFrame = Array.from(toolBoxElements).map((el, i) => {
      if(!el.parentElement.id.includes("container")){ //exclude logos already embedded in containers
        const isText = el.id.includes("text")
        const isImg = el.id.includes("logo")
        return {
          id: el.id,
          top: parseInt(el.style.top.replace("px", "")),
          left: parseInt(el.style.left.replace("px", "")),
          width: (isText || isImg) ? (isText ? el.offsetWidth : el.width) : parseInt(el.style.width.replace("px", "")),
          height: (isText || isImg) ? (isText ?  el.offsetHeight : el.height) : parseInt(el.style.height.replace("px", ""))
      }
    } else return null
  }).filter(el => el !== null)

    const toolBoxElementsToSerialized = Array.from(toolBoxElements).map((el, i) => {
      var elInformation = {
        id: "",
        left: "",
        top: "",
        width: "",
        height: "",
        content: "",
        outer: "",
        type: ""
      }
      elInformation.id = el.id
      elInformation.top = el.style.top
      elInformation.left = el.style.left
      elInformation.width = el.style.width
      elInformation.height = el.style.height
      const top = parseInt(elInformation.top.replace("px", ""))
      const left = parseInt(elInformation.left.replace("px", ""))
      const right = left + parseInt(elInformation.width.replace("px", ""))
      const height = parseInt(elInformation.height.replace("px", ""))
      if(el.id.includes("img")) {
        elInformation.type = "img"
      } else if(el.id.includes("container")) {
        elInformation.type = "container"
        Array.from(el.children).forEach(childEl => {
          elInformation.content += childEl.id + ","
        })
      } else if(el.id.includes("group")) {
        elInformation.type = "group"
        toolBoxElementsFrame.forEach(elChild => {
          console.log(elChild)
          console.log(el)
          if(elChild.left > left
            && (elChild.left+elChild.width) < right
            && (elChild.top) > top
            && (elChild.top + elChild.height) < (top + height)){
              elInformation.content += elChild.id + ","
            }
        })
      } else if(el.id.includes("text")) {
        elInformation.type = "text"
      }
      return elInformation
    })

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
    this.setState({contextMenu: true, contextMenuCoords: [left, top]})
  }

  renderContextMenu(e){
   return (<div id="contextMenu" style={{left: this.state.contextMenuCoords[0],top:this.state.contextMenuCoords[1]}}>
            List
            <span onClick={() => {this.setState({contextMenu: false})}}>X</span>
            </div>)
  }

  render() {
    /*var video = document.createElement('video-player');
    var curtime = video.currentTime;*/
    return (

      <div className="Main">
      {(this.state.contextMenu) ? this.renderContextMenu() : ""}
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
                <div onClick={this.publishToolBox.bind(this)}>P</div>
                <div onClick={this.onEditToolBox.bind(this)}>E</div>
                  {/*<i class="fas fa-edit" onClick={this.onEditToolBox}></i>*/}
                </div>
                <ToolBox editMode={this.state.editMode} showContextMenu={e => this.showContextMenu(e)}/>
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
export default connect(mapStateToProps, null)(Main);
