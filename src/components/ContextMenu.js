import React, { Component } from 'react';

const VIEW = {
  MENU: 0,
  IMG: 1,
  TEXT: 2
}

const BUTTON = "BUTTON"
const GRID = "GRID"

class ContextMenu extends Component {
  constructor(props){
    super(props)

    this.state = {
      view: VIEW.MENU,
      bottomView: null,
      file: null,
      imgPreviewUrl: null
    }
  }

  uploadToDb = (e) => {
    e.preventDefault()
    const form = e.target;
     const data = {}
     for (let element of form.elements) {
       if (element.tagName === 'BUTTON') { continue; }
       data[element.name] = element.value;
     }
     console.log(data)
     //insert to DOM
    //TODO upload to mongo with image id retrieved when uploading
    this.props.closeContextMenu()
  }

  iconSelected(e){
    console.log("Worked")
    this.setState({bottomView: null, file: "fromDB", imgPreviewUrl: "../img/iMovie.webp"})
  }

  iconDbGridSelected(e, focus){
      this.setState({bottomView: GRID, iconUploadChosen: false})
  }

  uploadFromUrl = (e) =>
  {
     this.setState({bottomView: null, file: "fromURL"})
  }

  iconUploadOrURLSelected = (e) => {
    e.preventDefault()
    var value = null
    if(e.target.files && e.target.files.length > 0){
      let reader = new FileReader();
      let file = e.target.files[0];

      reader.onloadend = () => {
       this.setState({
         file: file,
         imgPreviewUrl: reader.result,
         bottomView: null,
       });
       console.log(this.state)
      }
      reader.readAsDataURL(file);
      console.log(file)
      value = "img"
    } else {
      value = e.target.value
    }
    if(value.length > 0){
      this.setState({imgPreviewUrl: value, bottomView: BUTTON}) // TODO escape string because of XSS
    } else {
      this.setState({imgPreviewUrl: value, bottomView: null})
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

/*                <form action='.' enctype="multipart/form-data">            */
/*onBlur={(e) => this.searchThroughDbPrepared(e, false)} */
  renderImgEdit(){
    return (<div class="custom-file">
            {
              (!this.state.file) ?
              (<div>
                <input type="file" id="customFile" class="custom-file-input" onChange={this.iconUploadOrURLSelected} />
                <label class="custom-file-label" for="customFile">Upload from file</label>
                <div class="seperator" />
                <div class="md-form file-path-wrapper">
                    <input class="file-path validate" onChange={this.iconUploadOrURLSelected} type="text" placeholder="Upload from URL" />
                </div>
                <div class="seperator" />
                <div class="md-form file-path-wrapper">
                  <input class="file-path validate" onFocus={(e) => this.iconDbGridSelected(e, true)} type="text" placeholder="Search through DB" />
                </div>
              </div>) : (
              <div class="context-menu-img-preview">
                <img width="30" height="30" src={this.state.imgPreviewUrl} />
                <form onSubmit={this.uploadToDb} noValidate>
                  <div class="md-form file-path-wrapper">
                    <input class="file-path validate" name="name" type="text" placeholder="Tool name" />
                    <div class="seperator" />
                    <input class="file-path validate" name="website" type="text" placeholder="Official website" />
                    <div class="seperator" />
                    <textarea class="file-path validate" name="description" type="text" placeholder="(Optional) Description" />
                  </div>
                  <button class="btn btn-primary" type="submit">Confirm</button>
                </form>
              </div>
              )
            }
              {(this.state.bottomView == GRID) ? (
              <div class="grid-wrapper">
                <div class="grid-container">
                  <div class="grid-item" onClick={() => this.iconSelected()}><img src={require("../img/iMovie.webp")} /></div>
                  <div class="grid-item"><img src={require("../img/iMovie.webp")} /></div>
                  <div class="grid-item"><img src={require("../img/iMovie.webp")} /></div>
                  <div class="grid-item"><img src={require("../img/iMovie.webp")} /></div>
                  <div class="grid-item"><img src={require("../img/iMovie.webp")} /></div>
                  <div class="grid-item"><img src={require("../img/iMovie.webp")} /></div>
                  <div class="grid-item"><img src={require("../img/iMovie.webp")} /></div>
                  <div class="grid-item"><img src={require("../img/iMovie.webp")} /></div>
                  <div class="grid-item"><img src={require("../img/iMovie.webp")} /></div>
                  <div class="grid-item"><img src={require("../img/iMovie.webp")} /></div>
                  <div class="grid-item"><img src={require("../img/iMovie.webp")} /></div>
                </div>
              </div>
            ) : ""}
            {(this.state.bottomView == BUTTON) ? (<button class="btn btn-primary" onClick={this.uploadFromUrl} type="submit">Upload</button>) : ""}
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

  renderMainView(){
    if(this.state.view == VIEW.MENU) {
      return this.renderMenu()
    } else if(this.state.view == VIEW.IMG)  {
      return this.renderImgEdit()
    } else if(this.state.view == VIEW.TEXT)  {
      return this.renderTextEdit()
    }
  }

  render() {
    return (
      <div id="ContextMenu" style={{left: this.props.contextMenuCoords[0],top:this.props.contextMenuCoords[1]}}>
        <div class="closeContextMenuBtn" style={{textAlign:"right"}} onClick={() => this.props.closeContextMenu()}>
          <i class="fas fa-times"></i>
        </div>
        {this.renderMainView()}
      </div>
    );
  }
}

export default ContextMenu;
