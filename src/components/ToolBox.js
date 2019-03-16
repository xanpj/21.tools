import React, { Component } from 'react';
import { connect } from "react-redux";
import { actionSetFlowInstance, actionSetToolContent } from "../actions/flowActions";

import * as Positions from '../resources/InfographicPositions';
import * as Serialization from './functionsSerialization'
import * as ToolBoxInteractions from './functionsRightScreen';
import * as FlowActions from './functionsFlows';

const LOGO_SIZE = 30;
class ToolBox extends Component {
  constructor(props){
    super(props)
    this.state = {
      editMode: props.editMode
    }
  }

  componentDidUpdate(){
  }

  toggleEditable(editMode){
    console.log("toggleEditable")
    const instance = this.props.flowInstance
    if(instance !== null){
      const selector = ".tool-box-el"
      //const self = this
      FlowActions.toggleDraggable(instance, selector, editMode, this.props.toolContent, () => {/*
        const toolBoxElements = document.getElementsByClassName('tool-box-el')
        const newToolContent = Serialization.serializeToolBoxElements(this.props.toolContent, toolBoxElements)
        console.log("Positions.film")
        console.log(Positions.film)
        console.log(newToolContent)
        const newToolContent2 = Positions.film.map(el => {
          if(el.id == "container_0"){
           return {...el, left: "20px"}
         } else return el
       })
        newToolContent2.splice(2, 1)
        console.log(newToolContent2)
        this.props.actionSetToolContent(newToolContent2)*/
        //this.props.actionSetToolContent(newToolContent2)
        console.log("filmPositions")
        const toolBoxElements = document.getElementsByClassName('tool-box-el')
        console.log(this.props.toolContent)
        const newToolContent = Serialization.serializeToolBoxElements(this.props.toolContent, toolBoxElements)
        this.props.actionSetToolContent(newToolContent)
        FlowActions.updatePosses(instance, newToolContent)
      })
    }
    //this.props.actionSetFlowInstance(instance)
    const toolBoxFrame = document.getElementsByClassName("tool-box")[0]
    editMode ? toolBoxFrame.classList.add("editmode") : toolBoxFrame.classList.remove("editmode")

  }

  componentWillReceiveProps(nextProps) {
    console.log("componentWillReceiveProps")
    console.log("nextProps")
    console.log(nextProps)
    if(nextProps.editMode !== this.props.editMode) {
      console.log("toggleEditable")
      this.toggleEditable(nextProps.editMode)
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
           this.props.onChange(this.state.editMode);
       }
     }

  componentDidMount() {
    if(this.props.flowInstance == null){
      console.log("componentDidMount")
      const toolBoxOuter = document.getElementById("ToolBox")
      toolBoxOuter.addEventListener('contextmenu', (e) => this.props.showContextMenu(e))
      ToolBoxInteractions.MakeDraggable(toolBoxOuter);
      ToolBoxInteractions.MakeZoomable(toolBoxOuter,4,0.2)
      const self = this
      window.jsPlumb.ready(function() {
        const flowInstance = FlowActions.initFlows(self.props.toolContent, Positions.toolConnections)
        self.props.actionSetFlowInstance(flowInstance)
      });
    }
  }

  renderLogos(){
    console.log("renderLogos")
    console.log(this.props)
    if(this.props.toolContent !== null){
      return this.props.toolContent.map((el, i) => {
        console.log(el)
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
  actionSetFlowInstance: (payload) => dispatch(actionSetFlowInstance(payload)),
  actionSetToolContent: (payload) => dispatch(actionSetToolContent(payload)),
});
export default connect(mapStateToProps, mapDispatchToProps)(ToolBox);
