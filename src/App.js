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
      view: CONSTANTS.VIEWS.MENU
    }

    this.db = new DbInterface()
  }
  async componentDidMount(){
    await this.db.authenticateAnonymousUser()
  }

  renderView(){
    if(this.state.view == CONSTANTS.VIEWS.EDIT){
      return (<div>
        <div id="UploadHeader">
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
          </div>
        <Main db={this.db}/>
    </div>
    )}
    else if(this.state.view == CONSTANTS.VIEWS.MAIN){
      return (
        <div>
          <Main backToMenu={() => this.setState({view: CONSTANTS.VIEWS.MENU}) } db={this.db}/>
        </div>
      )
    }
    else {
        return (<Menu />)
    }
  }

  render() {
    //components Menu / Edit / MAIN
    //params from url
    return (
      <div className="App">
      <div id="ToolPageHeader">Workflows</div>
      {this.renderView()}
      </div>
    );
  }
}

export default App;
