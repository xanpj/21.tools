import React, { Component } from 'react';
import * as Positions from '../resources/InfographicPositions';

const LOGO_SIZE = 30;
class ToolBox extends Component {
  constructor(props){
    super(props)
  }

  toggleEditable(editMode){
    const toolBoxOuter = document.getElementById("ToolBox")
    console.log(editMode)
    let toggleEditable = (el) => {editMode ? this.MakeUnDraggable(el) : this.MakeDraggable(el)}
    let toggleEditableReverse = (el) => {editMode ? this.MakeDraggable(el) : this.MakeUnDraggable(el)}
    toggleEditableReverse(toolBoxOuter)
    const toolBoxInner = document.getElementById("tool-logos")
    Array.from(toolBoxInner.children).forEach(el => toggleEditable(el))
    //Array.from(toolBoxOuter.children).forEach(el => toggleEditable(el))
    const toolBoxFrame = document.getElementsByClassName("tool-box")[0]
    editMode ? toolBoxFrame.classList.remove("editmode") : toolBoxFrame.classList.add("editmode")
  }

  componentWillReceiveProps(nextProps) {
    this.toggleEditable(nextProps.editMode)
  }

  componentDidMount() {
    const toolBoxOuter = document.getElementById("ToolBox")
    this.MakeDraggable(toolBoxOuter);
    this.MakeZoomable(toolBoxOuter,4,0.2)

    toolBoxOuter.addEventListener('contextmenu', (e) => this.editToolBox(e))
    const jsPlumb = window.jsPlumb
    jsPlumb.ready(function() {

      function makeFlow(init_id, init_coords, outer_id, outer_coords){
        var firstInstance = jsPlumb.getInstance();
        var sourceAnchor = ""
        var targetAnchor = ""
        if(outer_id == "container_3" || outer_id == "container_4"){
          sourceAnchor = "Top"
          if(outer_id == "container_4") {
            sourceAnchor = "Right"
          }
          targetAnchor = "Left"
          firstInstance.importDefaults({
            Connector : [ "Bezier", { curviness: 70 } ],
            Anchors : [ sourceAnchor, targetAnchor],
            Endpoint:[ "Dot", { radius:2 } ],
          });
        } else {
          if(init_coords.top > outer_coords.top){
            sourceAnchor = "Top"
            targetAnchor = "Bottom"
          }
          firstInstance.importDefaults({
            Connector : [ "Straight", { curviness: 1 } ],
            Anchors : [ sourceAnchor, targetAnchor],
            Endpoint:[ "Dot", { radius:1 } ],
          });
        }
          firstInstance.connect({
            source:init_id,
            target:outer_id,
          });
        }
      function getContainerCoords(el){
        var inner_elements_ids = el.content.split(",")
        inner_elements_ids = inner_elements_ids.map((inner_el_id, i) => inner_el_id.trim())
        const inner_elements = Positions.film.filter((inner_el, i) => inner_elements_ids.findIndex(el_id => el_id === inner_el.id) > -1)
        var leftX = null
        var rightX = null
        var topY = null
        if(inner_elements && inner_elements.length > 0){
          for (const el_id in inner_elements) {
            const el = inner_elements[el_id]
            const left_parsed = parseInt(el.left.replace("px", ""))
            const right_parsed = parseInt(el.left.replace("px", "")) //using left for left and right
            const top_parsed = parseInt(el.top.replace("px", ""))
            leftX = (leftX === null || (left_parsed < leftX)) ? left_parsed : leftX
            rightX = (rightX === null || (right_parsed > rightX)) ? right_parsed : rightX
            topY = (topY === null || (top_parsed > topY)) ? top_parsed : topY
          }
        }
        return {
          left: leftX + (LOGO_SIZE/2),
          width: (rightX + (LOGO_SIZE/2)) - (leftX + (LOGO_SIZE/2)),
          top: topY}
      }

      Positions.film.map((el, i) => {
        if(el.type == "container") {
          /*source container*/
          const container_init_id = el.id
          const container_init_coords = getContainerCoords(el)
          var a = document.getElementById(container_init_id);
          a.style.position = "absolute";
          a.style.left = container_init_coords.left+'px';
          a.style.width = container_init_coords.width+'px';
          a.style.height = LOGO_SIZE+'px';
          a.style.top = container_init_coords.top+'px';

          /*target container*/
          var nodes = el.outer.split(",")
          nodes = nodes.map((el, i) => el.trim())
          nodes.forEach(node => {
          var container_outer = (node) ? Positions.film.find(el2 => el2.id == node) : null
            if(container_outer) {
              const container_outer_id = container_outer.id
              const container_outer_coords = getContainerCoords(container_outer)
              var b = document.getElementById(container_outer_id)
              b.style.position = "absolute";
              b.style.left = container_outer_coords.left+'px';
              b.style.width = container_outer_coords.width+'px';
              a.style.height = LOGO_SIZE+'px';
              if(a.style.top >  b.style.top){
                b.style.top = (container_outer_coords.top + LOGO_SIZE)+'px';
              }
              makeFlow(container_init_id, container_init_coords, container_outer_id, container_outer_coords)
            }
          })
        }
        })
    });

    /*const toolBoxInner2 = document.getElementById("logo_1")
    this.MakeDraggable(toolBoxInner2);*/

  }

  timecodeChange(e){
    /*e.preventDefault()
    var myElement = document.getElementsByClassName('el-active');
    if(myElement !== undefined && myElement.length > 0){
      myElement[0].scrollIntoView()
    }*/

    /*
    <div id="logo0" className="tool-box-title-el" > Filmmaking in the 21st century</div>
    <img id="logo1" className="tool-box-logo-el" src={require("../img/logo-premiere-pro.png")} />
    <img id="logo2" className="tool-box-logo-el" src={require("../img/logo-premiere-pro.png")} />
    <img id="logo3" className="tool-box-logo-el el-used el-active" src={require("../img/logo-premiere-pro.png")} />
    */
  }

  editToolBox(e) {
    e.preventDefault();
    alert('success!');
    return false;
  }

  MakeDraggable(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elmnt.onmousedown = dragMouseDown;
    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }
    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
      elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }
    function closeDragElement() {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  MakeUnDraggable(elmnt) {
    elmnt.onmousedown = null
  }

  MakeZoomable(container,max_scale,factor) {
      var target = container
      console.log(target)
      var size = {w:target.width,h:target.height}
      target.setAttribute("style", "transform-origin: 0 0;");

      var pos = {x:0,y:0}
      var zoom_target = {x:0,y:0}
      var zoom_point = {x:0,y:0}
      var scale = 1

      const myitem = document.getElementById('tool-logos')

      if (myitem.addEventListener)
        {
            // IE9, Chrome, Safari, Opera
            window.addEventListener("mousewheel", MouseWheelHandler, false);
            // Firefox
            window.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
        }
        // IE 6/7/8
        else
        {
            window.attachEvent("onmousewheel", MouseWheelHandler);
        }

    function MouseWheelHandler(e)
    {
        console.log(e)
        zoom_point.x = e.pageX - e.offsetX
        zoom_point.y = e.pageY - e.offsetY

        e.preventDefault();
        // cross-browser wheel delta
        var e = window.event || e; // old IE support
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

        // determine the point on where the slide is zoomed in
        zoom_target.x = (zoom_point.x - pos.x)/scale
        zoom_target.y = (zoom_point.y - pos.y)/scale

        // apply zoom
        scale += delta*factor * scale
        scale = Math.max(1,Math.min(max_scale,scale))

        // calculate x and y based on zoom
        pos.x = -zoom_target.x * scale + zoom_point.x
        pos.y = -zoom_target.y * scale + zoom_point.y


        // Make sure the slide stays in its container area when zooming out
        if(pos.x>0)
            pos.x = 0
        if(pos.x+size.w*scale<size.w)
            pos.x = -size.w*(scale-1)
        if(pos.y>0)
            pos.y = 0
         if(pos.y+size.h*scale<size.h)
            pos.y = -size.h*(scale-1)

        update()
    }

    function update(){
      const left = target.style.left
      const top = target.style.top
      target.setAttribute("style", 'transform: scale('+scale+','+scale+'); left:'  + left + '; top: ' + top)
    }
  }

  renderLogos(){
    return Positions.film.map((el, i) => {
      if(el.type == "img")
        return (<img id={el.id} style={{top: el.top, left: el.left}} className="tool-box-logo-el" src={require("../img/"+el.content)} />)
      else if(el.type == "text")
        return (<span id={el.id} style={{top: el.top, left: el.left}} className="tool-box-text-el">{el.content}</span>)
      else if(el.type == "container")
        return (<div id={el.id} style={{top: el.top, left: el.left}} className="tool-box-container-el"></div>)
    })
  }

  render() {

    return (
      <div id="ToolBox" onClick={(e) => this.timecodeChange(e)}>
        <div id="tool-logos">
          {this.renderLogos()}
        </div>
      </div>
    );
  }
}

export default ToolBox;
