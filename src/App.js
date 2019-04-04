import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Main from './components/Main'

class App extends Component {
  render() {
    return (
      <div className="App">
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
        <Main />
      </div>
    );
  }
}

export default App;
