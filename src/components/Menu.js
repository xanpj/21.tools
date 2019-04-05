import React, { Component } from 'react';

import CONSTANTS from './../constants'

function MainMenu(props) {
  return (
    <div>
      <div class="row">
      <div class="form-row  search-bar">
        <div class="form-group col-md-12 ">

        <div class="search">
          <form action="">
            <div>How to do</div>
            <input type="search" placeholder="Videos" required />
            <div class="after-input">in the 21st century</div>
            <button type="submit">Search</button>
          </form>
        </div>

        </div>
      </div>
    </div>

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
    </div>
  </div>)
}

function CreateWorkflowMenu(props){
  return (
    <div>
      <h2>Create a new workflow</h2>
      <form onSubmit={props.handleSubmit} noValidate>
        <div class="search_2">
            <div>How to do</div>
            <input type="search" name="videoTitle" placeholder="Videos" required />
            <div class="after-input">in the 21st century</div>
        </div>
        <div class="custom_input">
            <input type="custom_input" name="toolbox" placeholder="Select Toolbox" required />
        </div>
        <div class="custom_input">
            <input type="custom_input" name="youtubeId" placeholder="Youtube Video ID" required />
        </div>
        <div class="custom_input">
            <input type="custom_input" name="tags" placeholder="Tags" required />
        </div>
        <div class="custom_input">
            <input type="custom_input" name="email" placeholder="Email" required />
        </div>
        <div class="custom_input">
            <input type="custom_input" name="website" placeholder="Website" required />
        </div>
        <div class="custom_input">
            <input type="custom_input" name="fullName" placeholder="Full Name/Artist Name" required />
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
      view: null
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
      this.props.changeView(CONSTANTS.VIEWS.EDIT,data)
  }

  renderView(){
    if(this.state.view === CONSTANTS.VIEWS.MENU_INTERNAL.CREATE_WORKFLOW){
      return <CreateWorkflowMenu handleSubmit={this.handleSubmit} back={() => this.setState({view: null})} />
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
