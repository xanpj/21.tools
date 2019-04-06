import React, { Component } from 'react';

import CONSTANTS from './../constants'

function MainMenu(props) {
  return (
    <div>
      <div class="row">
      <div class="form-row  search-bar">
        <div class="form-group col-md-12 ">

        <div class="search">
          <form action="" noValidate>
            <div>How to do</div>
            <input type="search" placeholder="XYZ" />
            <div class="after-input">in the 21st century</div>
            <button type="submit"><i class="fas fa-search"></i></button>
          </form>
        </div>
        <div class="dropdown">
          <div class={true ? "dropdown-menu main open" : "dropdown-menu main closed"} aria-labelledby="dropdownMenuMain">
            {[{toolPage: "video", count: "5"}].map((el, i) =>
              <button onClick={() => props.selectToolbox(el.toolPage)} class="dropdown-item" type="button">
              {el.toolPage}<span class="badge-new indropdown">{el.count} versions</span>
              </button>
            )}
          </div>
        </div>

        </div>
      </div>
    </div>

    {(props.menuEnabled) ? (
    <div class="row seperator">
        <div class="menu-btn-wrapper col-md-4">
          <div class="menu-btn" onClick={() => props.changeInternalView(CONSTANTS.VIEWS.MENU_INTERNAL.CREATE_WORKFLOW)}>
            <div class="menu-content-container">
              <i class="fas fa-file-video"></i>
            </div>
            <div class="menu-content-container">
              <b>New workflow</b>
              <p>Submit a youtube video explaining one of your 21st century workflows.</p>
            </div>
          </div>
        </div>
        <div class="menu-btn-wrapper col-md-4">
          <div class="menu-btn" onClick={() => props.changeInternalView(CONSTANTS.VIEWS.MENU_INTERNAL.CREATE_TOOLBOX)}>
            <div class="menu-content-container">
              <i class="far fa-edit"></i>
            </div>
            <div class="menu-content-container">
              <b>New toolbox</b>
              <p>Create a toolbox for common 21st century tasks in your field of expertise.</p>
            </div>
          </div>
        </div>
        <div class="menu-btn-wrapper col-md-4">
          <div class="menu-btn" onClick={() => props.changeInternalView(CONSTANTS.VIEWS.MENU_INTERNAL.REQUEST)}>
            <div class="menu-content-container">
              <div class="badge-new">New</div>
            </div>
            <div class="menu-content-container">
              <b>Request submission</b>
              <p>Request a 21st century workflow/toolbox from an expert.</p>
            </div>
          </div>
        </div>
    </div>) : ""}

  </div>)
}

function CreateWorkflowMenu(props){
  return (
    <div>
      <div id="menuBtnLeft" onClick={() => props.backToMenu()}><i class="fas fa-arrow-circle-left"></i>Menu</div>
      <h2>Create a new workflow</h2>
      <form onSubmit={props.handleSubmit} >
        <div class="search_2">
            <div>How to do</div>
            <input type="search" name="videoTitle" placeholder="Videos" required={true} />
            <div class="after-input2">in the 21st century</div>
        </div>
        <div class="custom_input">
            <input type="text" name="toolbox" value={props.selectedToolbox || props.textToolbox} onChange={(e) => props.searchToolbox(e.target.value)} placeholder="Select Toolbox" required={true} />
        </div>
        <div class="dropdown">
          <div class={(props.toolboxResults.length > 0 && !props.selectedToolbox) ? "dropdown-menu main open" : "dropdown-menu main closed"} aria-labelledby="dropdownMenuMain">
            {props.toolboxResults.map((el, i) =>
              <button onClick={() => props.selectToolbox(el.toolPage)} class="dropdown-item" type="button">
              {el.toolPage}<span class="badge-new indropdown">{el.count} versions</span>
              </button>
            )}
          </div>
        </div>

        <div class="custom_input">
            <input type="text" name="youtubeId" placeholder="Youtube Video ID" required={true} />
        </div>
        <div class="custom_input">
            <input type="text" name="tags" placeholder="Tags" />
        </div>
        <div class="custom_input">
            <input type="email" name="email" placeholder="Email" required={true} />
        </div>
        <div class="custom_input">
            <input type="text" name="website" placeholder="Website" />
        </div>
        <div class="custom_input">
            <input type="text" name="fullName" placeholder="Full Name/Artist Name" />
        </div>
        <div class="submit_input">
            <button type="submit">Select tools</button>
        </div>
      </form>


    </div>)
}

class Menu extends Component {

  constructor(props){
    super(props)

    this.handleSubmit = this.handleSubmit.bind(this)

    this.state = {
      view: null,
    }
  }

  handleSubmit(event){
    event.preventDefault()
    const form = event.target;
     const data = {}
     for (let element of form.elements) {
       if (element.tagName === 'BUTTON') { continue; }
       data[element.name] = element.value;
     }
      console.log(data)
      const postData = {
        ...data,
        timecode: []
      }
      this.props.changeView(CONSTANTS.VIEWS.EDIT,postData)
  }

  renderView(){
    console.log(this.props.toolboxResults)
    if(this.state.view === CONSTANTS.VIEWS.MENU_INTERNAL.CREATE_WORKFLOW){
      return <CreateWorkflowMenu selectedToolbox={this.props.selectedToolbox} selectToolbox={(toolPage) => this.props.selectToolbox(toolPage)} textToolbox={this.props.textToolbox} backToMenu={() => this.setState({view: null}) } toolboxResults={this.props.toolboxResults} searchToolbox={(toolName) => this.props.searchToolbox(toolName)} handleSubmit={this.handleSubmit} back={() => this.setState({view: null})} />
    } else {
      return <MainMenu changeInternalView={(view) => this.setState({view: view})} />
    }
  }

  render() {
    return (
      <div id="Menu">
      <div id="ToolPageHeader">Workflows</div>
        <div class="outer">
        <div class="middle">
        <div class="inner">

          <div class="menu-wrapper">
          <div class="container">

          {this.renderView()}

          </div>
        </div>

        </div>
        </div>
        </div>
      </div>
    );
  }
}

export default Menu;
