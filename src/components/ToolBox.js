import React, { Component } from 'react';
import { connect } from "react-redux";
import { actionSetFlowInstance } from "../actions/flowActions";

import * as Positions from '../resources/InfographicPositions';
import * as ToolBoxInteractions from './functionsRightScreen';
import * as FlowActions from './functionsFlows';

const LOGO_SIZE = 30;
class ToolBox extends Component {
  constructor(props){
    super(props)
    this.state = {
      value: props.value
    }
  }

  componentDidUpdate(){
    console.log("Toolbox this.state")
    console.log(this.state)
    console.log("Toolbox this.props")
    console.log(this.props)
  }

  toggleEditable(editMode){
    const instance = this.props.flowInstance
    if(instance !== null){
      const selector = ".tool-box-el"
      FlowActions.toggleDraggable(instance, selector, editMode, Positions.film)
    }
    //this.props.actionSetFlowInstance(instance)
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
      const flowInstance = FlowActions.initFlows(toolContent)
      self.props.actionSetFlowInstance(flowInstance)
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

const mapStateToProps = state => ({
  ...state
});
const mapDispatchToProps = dispatch => ({
  actionSetFlowInstance: (payload) => dispatch(actionSetFlowInstance(payload))
});
export default connect(mapStateToProps, mapDispatchToProps)(ToolBox);
