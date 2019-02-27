import React, { Component } from 'react';
import * as Positions from '../resources/InfographicPositions';
import * as ToolBoxInteractions from './functionsRightScreen';
import * as FlowActions from './functionsFlows';

const LOGO_SIZE = 30;
class ToolBox extends Component {
  constructor(props){
    super(props)
  }

  toggleEditable(editMode){
    const toolBoxOuter = document.getElementById("ToolBox")
    console.log(editMode)
    let toggleEditable = (el) => {editMode ? ToolBoxInteractions.MakeUnDraggable(el) : ToolBoxInteractions.MakeDraggable(el)}
    let toggleEditableReverse = (el) => {editMode ? ToolBoxInteractions.MakeDraggable(el) : ToolBoxInteractions.MakeUnDraggable(el)}
    //toggleEditableReverse(toolBoxOuter)
    const toolBoxInner = document.getElementById("tool-logos")
    //Array.from(toolBoxInner.children).forEach(el => (el.classList.contains("tool-box-logo-el")) ? toggleEditable(el) : null)
    const toolBoxFrame = document.getElementsByClassName("tool-box")[0]
    editMode ? toolBoxFrame.classList.remove("editmode") : toolBoxFrame.classList.add("editmode")
  }

  componentWillReceiveProps(nextProps) {
    this.toggleEditable(nextProps.editMode)
  }

  componentDidMount() {
    const toolBoxOuter = document.getElementById("ToolBox")
    toolBoxOuter.addEventListener('contextmenu', (e) => this.editToolBox(e))
    ToolBoxInteractions.MakeDraggable(toolBoxOuter);
    ToolBoxInteractions.MakeZoomable(toolBoxOuter,4,0.2)
    const toolContent = Positions.film
    window.jsPlumb.ready(function() {
      FlowActions.initFlows(toolContent)
    });
  }

  editToolBox(e) {
    e.preventDefault();
    alert('success!');
    return false;
  }


  renderLogos(){
    return Positions.film.map((el, i) => {
      if(el.type == "img")
        return (<img id={el.id} style={{top: el.top, left: el.left}} className="tool-box-logo-el tool-box-el" src={require("../img/"+el.content)} />)
      else if(el.type == "text")
        return (<span id={el.id} style={{top: el.top, left: el.left}} className="tool-box-text-el tool-box-el">{el.content}</span>)
      else if(el.type == "container")
        return (<div id={el.id} style={{top: el.top, left: el.left}} className="tool-box-container-el tool-box-el"></div>)
      else if(el.type == "group")
        return (<div id={el.id} style={{top: el.top, left: el.left}} className="tool-box-group-el tool-box-el"></div>)
    })
  }

  render() {

    return (
      <div id="ToolBox">
        <div id="tool-logos">
          {this.renderLogos()}
        </div>
      </div>
    );
  }
}

export default ToolBox;
