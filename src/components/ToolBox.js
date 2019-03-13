import React, { Component } from 'react';
import * as Positions from '../resources/InfographicPositions';
import * as ToolBoxInteractions from './functionsRightScreen';
import * as FlowActions from './functionsFlows';

const LOGO_SIZE = 30;
class ToolBox extends Component {
  constructor(props){
    super(props)

    this.state = {
      flowInstance: null,
      value: props.value
    }

  }

  toggleEditable(editMode){
    const instance = this.state.flowInstance
    if(instance !== null){
      const selector = ".tool-box-el"
      FlowActions.toggleDraggable(instance, selector, editMode, Positions.film)
    }

    const toolBoxFrame = document.getElementsByClassName("tool-box")[0]
    editMode ? toolBoxFrame.classList.add("editmode") :  toolBoxFrame.classList.remove("editmode")
  }

  componentWillReceiveProps(nextProps) {
    this.toggleEditable(nextProps.editMode)
    if(nextProps.value !== this.props.value) {
        // new value from the parent - copy it to state
        this.setState({value : nextProps.value});
    }
  }

  onValueChanged = (e) => {
       const {value} = e.target;
       // No empty strings
       const isValid = value !== "";
       this.setState({value, isValid}, this.onStateUpdated);
   }

   onStateUpdated = () => {
       if(this.state.isValid) {
           this.props.onChange(this.state.value);
       }
     }

  componentDidMount() {
    const toolBoxOuter = document.getElementById("ToolBox")
    toolBoxOuter.addEventListener('contextmenu', (e) => this.props.showContextMenu(e))
    ToolBoxInteractions.MakeDraggable(toolBoxOuter);
    ToolBoxInteractions.MakeZoomable(toolBoxOuter,4,0.2)
    const toolContent = Positions.film
    const self = this
    window.jsPlumb.ready(function() {
      self.setState({
        flowInstance: FlowActions.initFlows(toolContent)
      })
    });
  }

  renderLogos(){
    return Positions.film.map((el, i) => {
      if(el.type == "img")
        return (<img id={el.id} style={{top: el.top, left: el.left}} className="tool-box-logo-el tool-box-el-hack tool-box-el" src={require("../img/"+el.content)} />)
      else if(el.type == "text")
        return (<span id={el.id} style={{top: el.top, left: el.left}} className="tool-box-text-el tool-box-el-hack tool-box-el">{el.content}</span>)
      else if(el.type == "container")
        return (<div id={el.id} style={{top: el.top, left: el.left}} className="tool-box-container-el tool-box-el-hack tool-box-el"></div>)
      else if(el.type == "group")
        return (<div id={el.id} style={{top: el.top, left: el.left}} className="tool-box-group-el tool-box-el-hack tool-box-el"></div>)
    })
  }

  render() {
    const value = this.state.value;
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
