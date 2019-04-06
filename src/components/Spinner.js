import React, { Component } from 'react';

class Spinner extends Component {
  constructor(props){
    super(props)
  }

  render() {
    return (
        <div class={(!this.props.view) ? "spinner" : "spinner-toolbox"}>
          <img src="spinner-eclipse.svg" />
        </div>
    );
  }
}

export default Spinner;
