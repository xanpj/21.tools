import React, { Component } from 'react';
import { connect } from "react-redux";
import { actionSetFlowInstance, actionSetToolContent } from "../actions/flowActions";

import * as Positions from '../resources/InfographicPositions';
import * as Serialization from './functionsSerialization'
import * as ToolBoxInteractions from './functionsRightScreen';
import * as FlowActions from './functionsFlows';
import interact from 'interactjs'
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
      const toolBoxOuter = document.getElementById("ToolBox")
      if(editMode) {
        ToolBoxInteractions.MakeUnDraggable(toolBoxOuter)
      } else {
        ToolBoxInteractions.MakeDraggable(toolBoxOuter);
      }

      const toolBoxGroupsSelector = ".tool-box-group-el"
      const self = this
      interact(toolBoxGroupsSelector).resizable({
        // resize from all edges and corners
        edges: { left: true,  top: true, right: false, bottom: false },

        modifiers: [
          // keep the edges inside the parent
          /*interact.modifiers.restrictEdges({
            outer: 'parent',
            endOnly: true,
          }),*/

          // minimum size
          /*interact.modifiers.restrictSize({
            min: { width: 100, height: 50 },
          }),*/
        ],

        inertia: true
      })
      .on('resizestart', function (event) {
        FlowActions.onlyToggleDraggable(instance, event.target.id, false)
      })
      .on('resizemove', function (event) {
          var target = event.target,
              x = (parseFloat(target.getAttribute('data-x')) || 0),
              y = (parseFloat(target.getAttribute('data-y')) || 0);

          // update the element's style
          target.style.width  = event.rect.width + 'px';
          target.style.height = event.rect.height + 'px';

          // translate when resizing from top or left edges
          if(event.edges.right || event.edges.bottom){
            x -= event.deltaRect.right;
            y -= event.deltaRect.bottom;
          }

          target.style.webkitTransform = target.style.transform =
              'translate(' + x + 'px,' + y + 'px)';

          target.setAttribute('data-x', x);
          target.setAttribute('data-y', y);
          FlowActions.revalidate(instance, event.currentTarget.id)
      })
      .on('resizeend', function (event) {
        var target = event.target
        const orgLeft = target.style.left
        const orgTop = target.style.top
        const newLeft = (parseFloat(orgLeft) + parseFloat(target.dataset.x)) + "px"
        const newTop = (parseFloat(orgTop) +  parseFloat(target.dataset.y)) + "px"
        target.style.left = newLeft
        target.style.top = newTop
        target.style.webkitTransform = target.style.transform = '';
        target.setAttribute('data-x', 0);
        target.setAttribute('data-y', 0);
        FlowActions.onlyToggleDraggable(instance, event.target.id, true)
      });

      const toolBoxSelector = ".tool-box-el"
      //const self = this
      FlowActions.toggleDraggable(instance, toolBoxSelector, editMode, this.props.toolContent, () => {/*
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

  onValueChanged(e) {
       const {value} = e.target;
       // No empty strings
       const isValid = value !== "";
       this.setState({value, isValid}, this.onStateUpdated);
   }

   onStateUpdated() {
       if(this.state.isValid) {
           this.props.onChange(this.state.editMode);
       }
     }

  componentDidMount() {
    if(this.props.flowInstance == null){
      console.log("componentDidMount")
      const toolBoxOuter = document.getElementById("ToolBox")
      ToolBoxInteractions.MakeDraggable(toolBoxOuter);
      ToolBoxInteractions.MakeZoomable(toolBoxOuter,4,0.2)
      toolBoxOuter.addEventListener('contextmenu', (e) => this.props.showContextMenu(e))
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
          if(el.type == "img")
            return (<img id={el.id} style={{top: el.top, left: el.left}} className="tool-box-logo-el tool-box-el-hack tool-box-el" src={require("../img/"+el.content)} />)
          else if(el.type == "text")
            return (<span id={el.id} style={{top: el.top, left: el.left}} className="tool-box-text-el tool-box-el-hack tool-box-el">{el.content}</span>)
          else if(el.type == "container")
            return (<div id={el.id} style={{top: el.top, left: el.left}} className="tool-box-container-el tool-box-el-hack tool-box-el"></div>)
          else if(el.type == "group")
            return (<div id={el.id} style={{top: el.top, left: el.left}} className="tool-box-group-el tool-box-el-hack tool-box-el">
            <div class="group-resize-handle"></div>
            </div>)
      })
    }
  }

  renderAddTextData(){
    const addTextData = this.props.addTextData
    return (
      <span id={addTextData.id}
       style={{top: addTextData.top, left: addTextData.left}}
       className="tool-box-text-el tool-box-el-hack tool-box-el">
       {addTextData.content}
      </span>
    )
  }

  render() {
    const value = this.state.value;
    return (
      <div id="ToolBox">
      {(this.props.addTextData !== null) ? this.renderAddTextData() : ""}
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
