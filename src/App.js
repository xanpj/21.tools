import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import CONSTANTS from './constants'
import Menu from './components/Menu'
import Main from './components/Main'
import Spinner from './components/Spinner'
import DbInterface from './components/DbInterface'

class App extends Component {

  constructor(props){
    super(props)

    this.state = {
      view: CONSTANTS.VIEWS.MENU,
      data: null,
      workflowData: null,
      toolboxData: null,
      toolboxResults: [],
      selectedToolbox: "",
      textToolbox: "",
      workflowResults: [],
      selectedWorkflow: "",
      textWorkflow: ""
    }

    this.db = new DbInterface()
  }

  async componentDidMount(){
  }

  async componentWillMount(){
    //5ca8507120a84470fdb90363
    /** params from URL **/
    var currentLocation = window.location
    await this.db.authenticateAnonymousUser()
    console.log(currentLocation)
    if(currentLocation.pathname !== "/"){
        this.setState({
          view: CONSTANTS.VIEWS.LOADING,
        })

      const videoUrl = currentLocation.pathname.slice(1)
      const videoUrlArr = videoUrl.split("-")
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

  /** Workflow autocomplete **/
  async searchWorkflow(workflowName){
    console.log("workflowName")
    console.log(workflowName)
    this.setState({
      textWorkflow: workflowName
    })
    if(workflowName.length > 0){
      const workflowResults = await this.db.searchWorkflow(workflowName)
      console.log("workflowResults")
      console.log(workflowResults)
      this.setState({
        workflowResults: workflowResults,
        selectedWorkflow: null
      })
    } else {
      this.setState({
        workflowResults: [],
        selectedWorkflow: null
      })
    }
  }

  changeView(view, data){
    if(view == CONSTANTS.VIEWS.EDIT) {
      this.setState({view:  view, workflowData: data})
    } else if(view == CONSTANTS.VIEWS.TOOLBOX){
      this.setState({view:  view, toolboxData: data})
    }
  }

  selectWorkflow(workflowId, workflowName){
    this.setState({
      selectedWorkflow: workflowName,
      workflowResults: []
    })
    console.log(workflowId.id)
    const urlString = btoa(unescape(encodeURIComponent(workflowName))) + "-" + workflowId.toString()
    window.location.pathname = "/"+urlString
  }
  /** END Workflow autocomplete **/

  selectToolbox(toolbox){
    this.setState({
      selectedToolbox: toolbox
    })
  }

  /** Toolbox autocomplete **/
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
  /** END Toolbox autocomplete **/


  renderView(){
    if(this.state.view == CONSTANTS.VIEWS.LOADING){
        return (<Spinner />)
    }
    else if(this.state.view == CONSTANTS.VIEWS.TOOLBOX){
      return (<div>
              <Main toolboxData={this.state.toolboxData}
                    workflowData = {null}
                    backToMenu={() => this.backToMenu()}
                    submitWorkflow={(timecode, version) => this.submitWorkflow(timecode, version)}
                    toolboxMode={true}
                    db={this.db} />
              </div>)
    }
    else if(this.state.view == CONSTANTS.VIEWS.EDIT){
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
        return (<Menu textWorkflow={this.state.textWorkflow}
                      selectedWorkflow={this.state.selectedWorkflow}
                      selectWorkflow={(workflowId, workflowName) => this.selectWorkflow(workflowId, workflowName)}
                      searchWorkflow={(workflowName) => this.searchWorkflow(workflowName)}
                      workflowResults = {this.state.workflowResults}
                      textToolbox={this.state.textToolbox}
                      selectedToolbox={this.state.selectedToolbox}
                      selectToolbox={(toolbox) => this.selectToolbox(toolbox)}
                      searchToolbox={(toolName) => this.searchToolbox(toolName)}
                      toolboxResults = {this.state.toolboxResults}
                      changeView={(view, data) => this.changeView(view, data)}/>)
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
