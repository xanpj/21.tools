import React, { Component } from 'react';

const TOOLSDATABASE_FILE_PREVIEW = 'toolsdatabase-file-preview'

class ToolsDatabase extends Component {
  constructor(props){
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleUpload = this.handleUpload.bind(this)

    this.state = {
      data: []
    }
  }

  componentDidMount(){
  //TODO
  }

  async handleUpload(e){
    e.preventDefault()
    const form = e.target;
    var data = {}
    for (let element of form.elements) {
       if (element.tagName === 'BUTTON') { continue; }
       {
         if(!data[element.name]){
           data[element.name] = [element.value]
         } else {
           data[element.name].push(element.value);
         }
       }
    }
    const filePreviews = document.getElementsByClassName(TOOLSDATABASE_FILE_PREVIEW)
    if(filePreviews && data.name){
      data = data.name.map((el,i) => ({name: data.name[i], website: data.website[i], description: data.description[i], content: filePreviews[i].src}))
    }
    const queryResult = await this.props.db.uploadToToolDatabase(data)
    if(queryResult){
      alert("Upload succeeded")
    } else {
      alert("Upload failed")
    }
  }


  handleSubmit(e){
    this.iconUploadOrURLSelected(e)
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
                  const data = {
                    imgPreview: dataUrl,
                    fileName: file.name
                  }
                  self.setState({
                    data: [...self.state.data, data]
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
      for(let i = 0;i<e.target.files.length;i++){
        this.uploadAndResize(e.target.files[i])
      }
    } else {
      value = e.target.value
      console.log("value")
      console.log(value)
    }
  }


  render() {
    console.log(this.state)
    return (
        <div id="ToolsDatabase">
          <div class="outer">
          <div class="middle">
          <div class="inner">

            <div class="about-wrapper">
              <div class="container">

                <div class="row">
                  TOOLSDATABASE

                  <div class="custom-file">
                    <form onSubmit={this.handleSubmit} noValidate>
                      <input type="file" multiple={true} id="customFile" class="custom-file-input" onChange={this.iconUploadOrURLSelected} />
                      <label class="custom-file-label" for="customFile">Upload from file</label>
                    </form>
                  </div>
                </div>

                <form onSubmit={this.handleUpload} noValidate>
                <div class="row seperator">
                  <div class="tools-database-table">
                    <table class="tg">
                    <tbody>
                    <tr>
                     <th>FileName</th>
                     <th>Name</th>
                     <th>Website</th>
                     <th>Description</th>
                     <th>Image Preview</th>
                   </tr>
                    {
                      this.state.data.map((el,i) =>
                        (<tr>
                          <th class="tg-0lax">{el.fileName}</th>
                          <th class="tg-0lax"><input type="text" name="name" /></th>
                          <th class="tg-0lax"><input type="text" name="website" /></th>
                          <th class="tg-0lax"><textarea type="text" name="description" /></th>
                          <th class="tg-0lax"><img class={TOOLSDATABASE_FILE_PREVIEW} src={el.imgPreview} /></th>
                        </tr>)
                      )
                    }
                      </tbody>
                      </table>
                  </div>
                </div>
                <div class="row seperator form-btn-container">
                  <button class="btn btn-primary" type="submit">Upload All</button>
                </div>
                </form>


              </div>
            </div>

          </div>
          </div>
          </div>
        </div>
    );
  }
}

export default ToolsDatabase;
