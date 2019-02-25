import React, { Component } from 'react';
import ToolBox from './ToolBox'
import * as Positions from '../resources/InfographicPositions';


class Main extends Component {

  constructor(props){
    super(props)

    this.state ={
      videoInitialized: false,
      timecode: Positions.filmTimecode,
    }
  }


  updateHighlightedLogo(currentTime) {
      console.log(currentTime);
  }

  componentDidMount(){
    // Get the <video> element with id="myVideo"
    const state = this.state
    console.log(state)
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


  render() {
    /*var video = document.createElement('video-player');
    var curtime = video.currentTime;*/
    return (

      <div className="Main">
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
                <i class="fas fa-edit"></i>
              </div>
              <ToolBox />
            </div>
          </div>

        </div>
      </div>
    );
  }
}

export default Main;
