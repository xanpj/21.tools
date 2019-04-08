import React, { Component } from 'react';
import { connect } from "react-redux";
import logo from './logo.svg';
import './App.css';

import CONSTANTS from './constants'
import Menu from './components/Menu'
import Main from './components/Main'
import About from './components/About'
import ToolsDatabase from './components/ToolsDatabase'
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
      textWorkflow: "",
      workflowNotFound: null
    }

    this.db = new DbInterface()
  }

  async componentDidMount(){
  }

  async componentWillMount(){
    /** params from URL **/
    var currentLocation = window.location
    await this.db.authenticateAnonymousUser()
    console.log(currentLocation)
    if(currentLocation.pathname !== "/"){
        this.setState({
          view: CONSTANTS.VIEWS.LOADING,
        })
    if(currentLocation.pathname === "/about"){
      this.setState({
        view: CONSTANTS.VIEWS.ABOUT
      })
    }
    else if(currentLocation.pathname === "/toolsdatabase"){
      this.setState({
        view: CONSTANTS.VIEWS.TOOLSDATABASE
      })
    }
    else {
        const videoUrl = currentLocation.pathname.slice(1)
        const videoUrlArr = videoUrl.split("-")
        if(videoUrlArr.length == 2) {
          const videoId = videoUrlArr[1]
          try {
            const workflowData = await this.db.getWorkflow(videoId)
            if(workflowData.length > 0){
              console.log("workflowData")
              console.log(workflowData)
              this.setState({
                view: CONSTANTS.VIEWS.MAIN,
                workflowData: workflowData[0],
                toolboxData: null,
              })
            } else {
              this.setState({
                view: CONSTANTS.VIEWS.MAIN,
                workflowNotFound: true
              })
            }
          } catch(err){
            this.setState({
              view: CONSTANTS.VIEWS.MAIN,
              workflowNotFound: true
            })
        }
        } else if(videoUrlArr.length == 1 && videoUrlArr[0].length > 0){
          try {
            const toolboxName = unescape(decodeURIComponent( atob(videoUrlArr[0] ) ) )
            console.log("toolbox")
            console.log(toolboxName)
            this.setState({
              view: CONSTANTS.VIEWS.MAIN,
              toolboxData: {
                name: toolboxName
              },
              workflowData: null
            })
          } catch(err){
            this.setState({
              view: CONSTANTS.VIEWS.MAIN,
              workflowNotFound: true
            })
          }
        }
      }
    }
  }

  async componentDidMount(){
  }

  backToMenu(){
      this.setState({view: CONSTANTS.VIEWS.MENU})
      window.location.pathname = "/"
  }

  async submitWorkflow(timecode, version){
    console.log(this.state.workflowData)
    const data = {
      ...this.state.workflowData,
      toolPageVersion: version,
      timecode: timecode,
    }
    console.log(data)
    const videoTitle = this.state.workflowData.videoTitle
    const lastInsertedId = await this.db.submitWorkflow(data)
    console.log(lastInsertedId)
    const urlString = btoa(unescape(encodeURIComponent(videoTitle))) + "-" + lastInsertedId.insertedId.toString()
    console.log(urlString)
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
      var workflowResults = []
      const onlyWorkflowResults  = await this.db.searchWorkflow(workflowName)
      const toolboxResultsAsWorkflowResultsRaw = await this.db.searchToolbox(workflowName)
      const toolboxResultsAsWorkflowResults = this.toolboxResultsTransformer(toolboxResultsAsWorkflowResultsRaw)
      console.log("toolboxResultsAsWorkflowResults")
      console.log(toolboxResultsAsWorkflowResults)
      console.log("workflowResults")
      console.log(workflowResults)
      workflowResults = onlyWorkflowResults.slice(0,5).concat(toolboxResultsAsWorkflowResults.slice(0,5))
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

  async changeView(view, data){
    if(view == CONSTANTS.VIEWS.EDIT) {
      this.setState({view:  view, workflowData: data})
    } else if(view == CONSTANTS.VIEWS.TOOLBOX){
      //TODO
      //check if toolbox exists
      //create new toolbox iwth initial tool
      //fill toolContent, either directly or via filling workflowData
      const toolboxName = data["toolbox"].toLowerCase()
      const toolboxData = await this.db.createToolbox(data)
      if(!toolboxData){
        console.log(toolboxData)
        alert("Toolbox '"+toolboxName+"' already exists" )
      } else {
        const urlString = btoa(unescape(encodeURIComponent(toolboxName)))
        window.location.pathname = "/"+urlString
      }
    }
  }

  selectWorkflow(workflowId, workflowName){
    //workflow was selected
    if(workflowId){
      this.setState({
        selectedWorkflow: workflowName,
        workflowResults: []
      })
      console.log(workflowId.id)
      const urlString = btoa(unescape(encodeURIComponent(workflowName))) + "-" + workflowId.toString()
      window.location.pathname = "/"+urlString
    } else { //toolbox was selected
      this.setState({
        selectedWorkflow: workflowName,
        workflowResults: []
      })
      const toolboxName = workflowName
      const urlString = btoa(unescape(encodeURIComponent(toolboxName)))
      window.location.pathname = "/"+urlString
    }
    }

  /** END Workflow autocomplete **/

  selectToolbox(toolbox){
    this.setState({
      selectedToolbox: toolbox
    })
  }

  toolboxResultsTransformer(toolboxResultsRaw) {
    var toolboxResults = []
    if(toolboxResultsRaw.length > 0 && toolboxResultsRaw[0].versions){
      toolboxResultsRaw = toolboxResultsRaw[0]
      var toolPageIncluded = []
      var toolPageVersions = []
      toolboxResultsRaw.versions.forEach((el, i) => {
        const splitted = el.split("-");
        const versionId = splitted[splitted.length - 1]
        const beginning = splitted.slice(0, splitted.length - 1)[0]
        if(splitted.length > 1){
          var idx = toolPageIncluded.indexOf(beginning)
          if(idx > -1){
            toolPageVersions[idx] += 1
          } else {
            toolPageIncluded.push(beginning)
            toolPageVersions.push(1)
          }
        }
      })
      toolboxResults = toolPageIncluded.map((el,i) => ({toolPage: el, versions: toolPageVersions[i]})).sort((a,b) => {return (a.versions < b.versions) ? 1 : -1})
    }
    return toolboxResults
  }

  /** Toolbox autocomplete **/
  async searchToolbox(toolName){
    console.log(toolName)
    this.setState({
      textToolbox: toolName
    })
    if(toolName.length > 0){
      var toolboxResultsRaw = await this.db.searchToolbox(toolName)
      console.log(toolboxResultsRaw)
      const toolboxResults = this.toolboxResultsTransformer(toolboxResultsRaw)
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
    else if(this.state.view == CONSTANTS.VIEWS.ABOUT){
      return (<About backToMenu={() => this.backToMenu()} />)
    }
    else if(this.state.view == CONSTANTS.VIEWS.TOOLSDATABASE){
      return (<ToolsDatabase backToMenu={() => this.backToMenu()} db={this.db} />)
    }
    else if(this.state.view == CONSTANTS.VIEWS.TOOLBOX){
      return (<div>
              <Main workflowNotFound={this.state.workflowNotFound}
                    toolboxData={this.state.toolboxData}
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
    </div>
    )}
    else if(this.state.view == CONSTANTS.VIEWS.MAIN){
      return (
        <div>
          <Main workflowNotFound={this.state.workflowNotFound} toolboxData={this.state.toolboxData} workflowData={this.state.workflowData} backToMenu={() => this.backToMenu()} db={this.db}/>
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
      <div id="ToolPageHeader">
        <div class="header-element logo"><a href="/"><img class="img-logo" src="logo.png" /></a></div>
        <div class="header-element">{this.props.toolboxHeader}</div>
      </div>
      {this.renderView()}
      <div id="Footer"><a href="/about">About</a></div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  ...state
});
export default connect(mapStateToProps, null)(App);
