import React, { Component } from 'react';

const VIEW = {
  MENU: 0,
  IMG: 1,
  TEXT: 2
}

const BUTTON = "BUTTON"
const GRID = "GRID"

/*function getBase64FromImageUrl(url) {
var img = new Image();
img.crossOrigin = "anonymous";  // This enables CORS
img.onload = function () {
    var canvas = document.createElement("canvas");
    canvas.width =this.width;
    canvas.height =this.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(this, 0, 0);
    var dataURL = canvas.toDataURL("image/png");
    console.log(dataURL)
};
img.src = url;
}*/


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
    const imgSrc = document.getElementById('img-preview').src
    const form = e.target;
    const data = {}
    for (let element of form.elements) {
       if (element.tagName === 'BUTTON') { continue; }
       data[element.name] = element.value;
    }

    const self = this;
    function resize(url, callback){
      var image = new Image();
      image.crossOrigin = "anonymous";  // This enables CORS
      image.onload = function () {
        var canvas = document.createElement('canvas'),
            max_size = 100,// TODO : pull max size from a site config
            width = image.width,
            height = image.height;
        if (width > height) {
            if (width > max_size) {
                height *= max_size / width;
                width = max_size;
            }
        } else {
            if (height > max_size) {
                width *= max_size / height;
                height = max_size;
            }
        }
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);
        var dataUrl = canvas.toDataURL("image/png");
        self.setState({
          file: "img",
          imgPreviewUrl: dataUrl,
          bottomView: null,
          imgData: null //only when uploading from DB
        });
        callback(dataUrl)
      }
        image.src = url;
    }

    function callback(dataUrl){
      self.props.insertImgToDocument(data, dataUrl)
    }

    resize(imgSrc, callback);
  }

  iconSelected(el){
    this.setState({bottomView: null, file: "fromDB", imgPreviewUrl: el.content, imgData: {website: el.website, name: el.name, description: el.description}})
  }

  iconDbGridSelected(e, focus){
      this.setState({bottomView: GRID, iconUploadChosen: false})
  }

  uploadFromUrl = (e) =>
  {
     this.setState({bottomView: null, file: "fromURL"})
  }


  uploadAndResize = function(file){
      // Ensure it's an image
      const self = this;
      if(file.type.match(/image.*/)) {
          // Load the image
          var reader = new FileReader();
          reader.onload = function (readerEvent) {
              var image = new Image();
              image.onload = function (imageEvent) {

                  // Resize the image
                  var canvas = document.createElement('canvas'),
                      max_size = 100,// TODO : pull max size from a site config
                      width = image.width,
                      height = image.height;
                  if (width > height) {
                      if (width > max_size) {
                          height *= max_size / width;
                          width = max_size;
                      }
                  } else {
                      if (height > max_size) {
                          width *= max_size / height;
                          height = max_size;
                      }
                  }
                  canvas.width = width;
                  canvas.height = height;
                  canvas.getContext('2d').drawImage(image, 0, 0, width, height);
                  var dataUrl = canvas.toDataURL('image/png');
                  self.setState({
                    file: "img",
                    imgPreviewUrl: dataUrl,
                    bottomView: null,
                  });
              }
              image.src = readerEvent.target.result;
          }
          reader.readAsDataURL(file);
      }
  };

  iconUploadOrURLSelected = (e) => {
    e.preventDefault()
    var value = null
    if(e.target.files && e.target.files.length > 0){
      this.uploadAndResize(e.target.files[0])
    } else {
      value = e.target.value
      if(value && value.length > 0){
        this.setState({imgPreviewUrl: value, bottomView: BUTTON}) // TODO escape string because of XSS
      } else {
        this.setState({imgPreviewUrl: value, bottomView: null})
      }
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
        return (<div><a class="context-menu-tool-website" target={"_blank"} href={this.props.contextMenuParam}>Visit Website</a></div>)
    }
  }

/*                <form action='.' enctype="multipart/form-data">            */
/*onBlur={(e) => this.searchThroughDbPrepared(e, false)} */
  renderImgEdit(){
    const {name, website, description} = this.state.imgData || {name:"", website: "", description:""}
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
                  <input class="file-path validate" onChange={(e) => this.props.searchToolDatabase(e.target.value)} onFocus={(e) => this.iconDbGridSelected(e, true)} type="text" placeholder="Search through DB" />
                </div>
              </div>) : (
              <div class="context-menu-img-preview">
                <img id="img-preview" width="30" height="30" src={this.state.imgPreviewUrl} />
                <form onSubmit={this.uploadToDb} noValidate>
                  <div class="md-form file-path-wrapper">
                    <input class="file-path validate" value={name} onChange={(e) => this.setState({imgData: {...this.state.imgData, name: e.target.value}})} name="name" type="text" placeholder="Tool name" />
                    <div class="seperator" />
                    <input class="file-path validate" value={website} onChange={(e) => this.setState({imgData: {...this.state.imgData, website: e.target.value}})} name="website" type="text" placeholder="Official website" />
                    <div class="seperator" />
                    <textarea class="file-path validate" value={description} onChange={(e) => this.setState({imgData: {...this.state.imgData, description: e.target.value}})} name="description" type="text" placeholder="(Optional) Description" />
                  </div>
                  <button class="btn btn-primary" type="submit">Confirm</button>
                </form>
              </div>
              )
            }
              {(this.state.bottomView == GRID) ? (
              <div class="grid-wrapper">
                <div class="grid-container">
                {
                  (this.props.toolsFromDB) ? this.props.toolsFromDB.map((el,i) => <div class="grid-item" key={i} onClick={() => this.iconSelected(el)}><img src={el.content} /></div>) : ""
                }
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
