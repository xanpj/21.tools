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
      editMode: props.editMode,
      activeDeleteMode: false,
      toolContentHash: null
    }
  }

  componentDidUpdate(){
    if(this.props.toolContent !== null){
      FlowActions.initContainers(this.props.flowInstance, this.props.toolContent)
    }
  }

  toggleEditable(editMode){
    const instance = this.props.flowInstance
    if(instance !== null){
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
        if(self.state.editMode){
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
        }
      })
      .on('resizeend', function (event) {
        if(self.state.editMode){
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
        }
      });

      const toolBoxOuter = document.getElementById("ToolBoxWrapper")
      if(editMode) {
        interact(toolBoxGroupsSelector).styleCursor(true)
        ToolBoxInteractions.MakeUnDraggable(toolBoxOuter)
      } else {
        interact(toolBoxGroupsSelector).styleCursor(false)
        ToolBoxInteractions.MakeDraggable(toolBoxOuter);
      }

      const toolBoxSelector = ".tool-box-el"
      //const self = this
      FlowActions.toggleDraggable(instance, toolBoxSelector, editMode, this.props.toolContent, (newlyJoinedTools) => {/*
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
        const toolBoxElements = document.getElementsByClassName('tool-box-el')
        const preElements = this.props.toolContent.map(el => el.id)
        const newToolContent = Serialization.serializeToolBoxElements(this.props.toolContent, toolBoxElements, newlyJoinedTools)
        const postElements = newToolContent.filter(el => preElements.indexOf(el.id) == -1)
        console.log("ToSaveFromSerialized")
        console.log(newToolContent)
        this.props.actionSetToolContent({toolContent: newToolContent})
        console.log("Worked")

        FlowActions.updatePosses(instance, newToolContent)
      })
    }
    //this.props.actionSetFlowInstance(instance)
    const toolBoxFrame = document.getElementsByClassName("tool-box")[0]
    editMode ? toolBoxFrame.classList.add("editmode") : toolBoxFrame.classList.remove("editmode")

  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.toolContentHash !== this.state.toolContentHash){
      //FlowActions.detachElement(this.props.flowInstance, "logo_2")
      alert(nextProps.toolContentHash)
      this.setState({toolContentHash: nextProps.toolContentHash})
      this.forceUpdate()
    }
    if(nextProps.editMode !== this.props.editMode) {
      this.setState({editMode: nextProps.editMode})
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
    if(this.props.flowInstance == null && this.props.toolContent !== null){
      const toolBoxOuter = document.getElementById("ToolBoxWrapper")
      toolBoxOuter.addEventListener('contextmenu', (e) => this.props.showContextMenu(e))
      toolBoxOuter.addEventListener('dblclick', (e) => this.activateDeleteMode(e))
      ToolBoxInteractions.MakeDraggable(toolBoxOuter);
      ToolBoxInteractions.MakeZoomable(toolBoxOuter,0.1,4,0.2)
      const self = this
      window.jsPlumb.ready(function() {
        console.log(self.props.toolConnections)
        const flowInstance = FlowActions.initFlows(self.props.toolContent, self.props.toolConnections)
        self.props.actionSetFlowInstance(flowInstance)
      });
    }
  }

  activateDeleteMode(){
     this.setState({activeDeleteMode: !this.state.activeDeleteMode})
      /*const closeButtons = document.getElementsByClassName("tool-box-el-close")
      const closableElements1 = document.getElementsByClassName("tool-box-logo-el")
      const closableElements2 = document.getElementsByClassName("tool-box-group-el")
      const closableElements3 = document.getElementsByClassName("tool-box-text-el")
      const allElementsToWiggle = [].concat.apply([], [Array.from(closeButtons), Array.from(closableElements1), Array.from(closableElements2), Array.from(closableElements3)]).flat(1)
      if(this.state.activeDeleteMode){
        allElementsToWiggle.forEach(el => el.classList.add("wiggle"))
      }  else {
        allElementsToWiggle.forEach(el => el.classList.remove("wiggle"))
      }*/
  }

  tooltipImgInfo(){
    if(!this.state.editMode){
      console.log("imgInfo")
    }
  }
  /*TODO:
  Versions
  toolbox GRID
  usage hints
  video selection
  video timecode
  */

  renderLogos(){
    if(this.props.toolContent !== null){
      console.log("this.props.toolContent")
      console.log(this.props.toolContent)
      return this.props.toolContent.map((el, i) => {
          /*if(el.type == "img")
            return (<img id={el.id} key={el.id} onMouseOver={() => this.tooltipImgInfo()} style={{top: el.top, left: el.left}} className="tool-box-logo-el tool-box-el-hack tool-box-el" src={(el.content.indexOf('data:image') > -1) ? el.content : require("../img/"+el.content)} />)
          */
          if(el.type == "img"){
            return (<img id={el.id} key={el.id} style={{top: el.top, left: el.left}} className="tool-box-logo-el tool-box-el-hack tool-box-el" src={(el.content.indexOf('data:image') > -1) ? el.content : require("../img/"+el.content)} />)
          }
          else if(el.type == "text")
            return (<div id={el.id} key={el.id} style={{top: el.top, left: el.left}} className="tool-box-text-el tool-box-el-hack tool-box-el">{el.content}</div>)
          else if(el.type == "container")
            return (<div id={el.id} key={el.id} style={{top: el.top, left: el.left}} className="tool-box-container-el tool-box-el-hack tool-box-el"></div>)
          else if(el.type == "group")
            return (<div id={el.id} key={el.id} style={{width:el.width, height:el.height, top: el.top, left: el.left}} className="tool-box-group-el tool-box-el-hack tool-box-el">
            <div class="group-resize-handle"></div>
            </div>)
      })
    } else {
      return <div></div>
    }
  }

  deleteElement(refId){
    if(this.props.flowInstance !== null && this.props.toolContent !== null){ //null check unnecessary
      const tempElement = document.getElementById(refId)
      const outerNode = document.getElementById("tool-logos")
      if(tempElement.children !== null){
        Array.from(tempElement.children).forEach(el => {
          tempElement.removeChild(el)
          outerNode.appendChild(el)
        })
      }
      const toolBoxElements = document.getElementsByClassName('tool-box-el')
      const newToolContent = Serialization.serializeToolBoxElements(this.props.toolContent, toolBoxElements, null)
      this.props.actionSetToolContent({toolContent: newToolContent})
      FlowActions.detachElement(this.props.flowInstance, refId)
      this.props.deleteElement(refId)
    }
  }

  renderClosingButtons(){
    if(this.props.toolContent !== null){
      return this.props.toolContent.map((el, i) => {
         const orgEl = document.getElementById(el.id)
          if(el && orgEl && !orgEl.parentNode.id.includes("container")){
            var left = parseFloat(el.left)
            if(orgEl.width)
              left += orgEl.width
            else
              left += orgEl.offsetWidth
            const refId = el.id
            const refCloseId = refId + "_close"
            return (<div className="tool-box-el-close" id={refCloseId} key={refCloseId} onClick={(e) => {this.deleteElement(el.id)}}  style={{top: el.top, left: left}} onClick={(e) => {this.deleteElement(refId)}}><i class="fas fa-times"></i></div>)
          } else return ""
      })
    }
  }

  renderToolTips(){
    if(this.props.toolContent !== null){
      return this.props.toolContent.map((el, i) => {
      if(el.type == "img"){
        return (
          <div class="item-hints" style={{top: el.top, left: el.left}}>
            <div class="hint" data-position="4">
              <div class="hint-content do--split-children">
                <span class="hint-content-inner">{el.id}</span>
              </div>
            </div>
          </div>
        )
        }
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
          {!this.state.editMode ? this.renderToolTips() : ""}
          {(this.state.activeDeleteMode && this.state.editMode ) ? this.renderClosingButtons() : ""}
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
