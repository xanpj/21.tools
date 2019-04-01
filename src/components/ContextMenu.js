import React, { Component } from 'react';

const VIEW = {
  MENU: 0,
  IMG: 1,
  TEXT: 2
}

class ContextMenu extends Component {
  constructor(props){
    super(props)
    this.state = {
      view: VIEW.MENU
    }
  }


  renderMenu(){
    if(this.props.editMode){
      return (<div>
                <ul class="list-group">
                 <li class="list-group-item" onClick={() => this.setState({view: VIEW.IMG})}><i class="fas fa-plus" /><i class="far fa-image" /></li>
                 <li class="list-group-item" onClick={() => this.props.addGroup()}><i class="fas fa-plus" /><i class="far fa-square" /></li>
                 <li class="list-group-item" onClick={() => this.setState({view: VIEW.TEXT})}><i class="fas fa-plus" /><i class="fas fa-font" /></li>
               </ul>
             </div>)
    } else {
        return (<div>Inspector</div>)
    }
  }

  renderImgEdit(){
    return (<div class="custom-file">
              <input type="file" class="custom-file-input" id="customFile" />
              <label class="custom-file-label" for="customFile">Upload from file</label>
              <div class="md-form file-path-wrapper">
                  <input class="file-path validate" type="text" placeholder="Upload from URL" />
              </div>
              <button class="btn btn-primary" type="submit">Upload</button>
          </div>)
  }

  renderTextEdit(){
    return (<div class="custom-file">
              <div class="md-form file-path-wrapper">
                  <input class="file-path validate" type="text" placeholder="Text" onChange={(e) => this.props.addTextOnChange(e)} />
              </div>
              <button class="btn btn-primary" onClick={() => this.props.onAddTextSubmit()} type="submit">Submit</button>
          </div>)
  }

  render() {
    return (
      <div id="ContextMenu" style={{left: this.props.contextMenuCoords[0],top:this.props.contextMenuCoords[1]}}>
        <div class="closeContextMenuBtn" style={{textAlign:"right"}} onClick={() => this.props.closeContextMenu()}>
          <i class="fas fa-times"></i>
        </div>
        {(this.state.view == VIEW.MENU) ? this.renderMenu() : (this.state.view == VIEW.IMG) ? this.renderImgEdit() : this.renderTextEdit()}
      </div>
    );
  }
}

export default ContextMenu;
