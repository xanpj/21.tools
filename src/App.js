import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import CONSTANTS from './constants'
import Menu from './components/Menu'
import Main from './components/Main'
import DbInterface from './components/DbInterface'

class App extends Component {

  constructor(props){
    super(props)

    this.state = {
      view: CONSTANTS.VIEWS.MENU,
      data: null,
      workflowData: null,
      toolboxResults: [],
      selectedToolbox: "",
      textToolbox: ""
    }

    this.db = new DbInterface()
  }

  async componentDidMount(){
    await this.db.authenticateAnonymousUser()
  }

  async componentWillMount(){
    //5ca8507120a84470fdb90363
    /** params from URL **/
    var currentLocation = window.location
    console.log(currentLocation)
    if(currentLocation.pathname !== "/"){
        this.setState({
          view: CONSTANTS.VIEWS.LOADING,
        })

      const videoUrl = currentLocation.pathname.slice(1)
      const videoUrlArr = videoUrl.split("-")
      await this.db.authenticateAnonymousUser()
      if(videoUrlArr.length > 0){
        const videoId = videoUrlArr[1]
        const workflowData = await this.db.getWorkflow(videoId)
        if(workflowData.length > 0){
          console.log("workflowData")
          console.log(workflowData)
          this.setState({
            view: CONSTANTS.VIEWS.MAIN,
            workflowData: workflowData[0],
          })
        }


      }
    }
  }

  async componentDidMount(){
  }

  backToMenu(){
      this.setState({view: CONSTANTS.VIEWS.MENU})
  }

  async submitWorkflow(timecode, version){
    console.log(this.state.workflowData)
    const data = {
      ...this.state.workflowData,
      toolPageVersion: version,
      timecode: timecode,
    }
    const videoTitle = this.state.workflowData.videoTitle
    const lastInsertedId = await this.db.submitWorkflow(data)
    console.log(lastInsertedId)
    const urlString = btoa(unescape(encodeURIComponent(videoTitle))) + "-" + lastInsertedId.insertedId.toString()
    console.log(urlString)
    /* REVERSE unescape(decodeURIComponent( atob(urlString.split("-")[0]) ) ) */
    console.log("Submitted")
    window.location.pathname = "/"+urlString
  }

  selectToolbox(toolbox){
    this.setState({
      selectedToolbox: toolbox
    })
  }

  async searchToolbox(toolName){
    console.log(toolName)
    this.setState({
      textToolbox: toolName
    })
    if(toolName.length > 0){
      const toolboxResults = await this.db.searchToolbox(toolName)
      this.setState({
        toolboxResults: toolboxResults,
        selectedToolbox: null
      })
    } else {
      this.setState({
        toolboxResults: [],
        selectedToolbox: null
      })
    }
  }



  renderView(){
    if(this.state.view == CONSTANTS.VIEWS.LOADING){
        return (<div class="spinner"><img src="spinner-eclipse.svg" /></div>)
    }
    if(this.state.view == CONSTANTS.VIEWS.EDIT){
      console.log("this.state.workflowData eDIT")
      console.log(this.state.workflowData)
      return (<div>
        <Main workflowData={this.state.workflowData}
              backToMenu={() => this.backToMenu()}
              submitWorkflow={(timecode, version) => this.submitWorkflow(timecode, version)}
              workflowMode={true}
              db={this.db} />

        {/*<div id="UploadHeader">
          <form>
          <div class="form-row">
          <label>Form header</label>
          </div>
            <div class="form-row">
              <div class="form-group col-md-2">
                <input type="email" class="form-control" id="inputEmail4" placeholder="Youtube video ID" />
              </div>
              <div class="form-group col-md-2">
                <input type="text" class="form-control" id="inputPassword4" placeholder="Video title" />
              </div>
              <div class="form-group col-md-2">
                <input type="email" class="form-control" id="inputEmail4" placeholder="Email" />
              </div>
              <div class="form-group col-md-2">
                <input type="text" class="form-control" id="inputPassword4" placeholder="Website" />
              </div>
              <div class="form-group col-md-2">
                <input type="text" class="form-control" id="inputPassword4" placeholder="Tags" />
              </div>

              <div class="form-group col-md-2">
                <button type="submit" class="btn btn-primary">Upload</button>
              </div>

            </div>
          </form>
          </div>*/}
    </div>
    )}
    else if(this.state.view == CONSTANTS.VIEWS.MAIN){
      return (
        <div>
          <Main workflowData={this.state.workflowData} backToMenu={() => this.backToMenu()} db={this.db}/>
        </div>
      )
    } else {
        return (<Menu textToolbox={this.state.textToolbox}
                      selectedToolbox={this.state.selectedToolbox}
                      selectToolbox={(toolbox) => this.selectToolbox(toolbox)}
                      searchToolbox={(toolName) => this.searchToolbox(toolName)}
                      toolboxResults = {this.state.toolboxResults}
                      changeView={(view, data) => this.setState({view:  view, workflowData: data}) }/>)
    }
  }

  render() {
    return (
      <div className="App">
      {this.renderView()}
      </div>
    );
  }
}

export default App;
