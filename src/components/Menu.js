import React, { Component } from 'react';

import CONSTANTS from './../constants'

class Menu extends Component {

  constructor(props){
    super(props)
  }

  render() {
    return (
      <div id="Menu">
        <div class="outer">
        <div class="middle">
        <div class="inner">

          <div class="menu-wrapper">
          <div class="container">
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
                  <div class="menu-btn">
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
                  <div class="menu-btn">
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
                  <div class="menu-btn">
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
