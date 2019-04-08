import React, { Component } from 'react';

class Spinner extends Component {
  constructor(props){
    super(props)
  }

  render() {
    return (
        <div class="not-found">
          404 - Content Not Found
        </div>
    );
  }
}

export default Spinner;
