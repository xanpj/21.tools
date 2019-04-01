import * as Serialization from './functionsSerialization'
import * as Utils from '../utils'

const jsPlumb = window.jsPlumb
const LOGO_SIZE = 30
const PADDING = 10


const anchors = [
            [0.5, 0, 0, 0],
            [0, 0.5, 0, 0],
            [1, 0.5, 0, 0],
            [0.5, 1, 0, 0],
        ]

const instanceConfig = {
  /*dragOptions: { cursor: 'pointer', zIndex: 2000 },
  paintStyle: { stroke: '#000' },
  endpointHoverStyle: { fill: "black" },
  hoverPaintStyle: { stroke: "black" },
  endpointStyle: { width: 20, height: 16, stroke: '#000' },
  endpoint: "Rectangle",
  anchors: anchors,
  container: "canvas",
  dragOptions: {
    drag: function(el) {
      console.log(el.el.id)
    }
  }*/
}

const dropOptions = {
    tolerance: "touch",
    hoverClass: "dropHover",
    activeClass: "dragActive"
};
const endpointConfig = {
    endpoint: ["Dot", { radius: 0.1 }],
    isSource: true,
    scope: "uno",
    paintStyle: { fill: "black", stroke:"black"},
    connectorStyle: {
        strokeWidth: 1,
        stroke: "#000",
        dashstyle: "solid",
    },

    //dragOptions: { cursor: 'pointer', zIndex: 2000 },
    anchors: ["TopCenter", "TopCenter"],
    endpointStyle: { fill: '#000' },
    endpointHoverStyle: { fill: "red" },
    hoverPaintStyle: { fill: "red", stroke:"red"},
    container: "canvas",
    deleteEndpointsOnDetach:false,
    ConnectionsDetachable: false,
    detachOnDelete:false,

    maxConnections: -1,
    connector: "Straight",
    isTarget: true,
    //dropOptions: dropOptions,
    /*dragOptions: {
      drag: function(el) {
        console.log(el.el.id)
      }
    },*/
    onMaxConnections: function (info) {
        alert("Cannot drop connection " + info.connection.id + " : maxConnections has been reached on Endpoint " + info.endpoint.id);
      }
};

const endpointConfigEditable = {...endpointConfig, endpoint: ["Dot", { radius: 5 }]}

function findInnerElements(toolContent, el) {
  var inner_elements_ids = el.content.split(",")
  inner_elements_ids = inner_elements_ids.map((inner_el_id, i) => inner_el_id.trim())
  return inner_elements_ids.map(el_id => toolContent.find((inner_el, i) => el_id === inner_el.id))
}

function getContainerCoords(toolContent, el){
  const inner_elements = findInnerElements(toolContent, el)
  var leftX = null
  var rightX = null
  var topY = null
  var heightY = null
  var lowestContainerHeightY = null
  var bottomY = null
  var widthX = 0
  if(inner_elements && inner_elements.length > 0){
    for (const el_id in inner_elements) {
      const el = inner_elements[el_id]
      const isContainerOrGroup = (el.type === "container" || el.type === "group") //styles are already set explicitly for container and groups
      const newEl = document.getElementById(el.id)
      if(newEl){
        var width_parsed = isContainerOrGroup ? parseInt(newEl.style.width.replace("px", "")) : newEl.offsetWidth
        var height_parsed = isContainerOrGroup ? parseInt(newEl.style.height.replace("px", "")) : newEl.offsetHeight
        var left_parsed = isContainerOrGroup ? parseInt(newEl.style.left.replace("px", "")) : parseInt(el.left.replace("px", ""))
        var right_parsed = left_parsed + (width_parsed)
        var top_parsed = isContainerOrGroup ? parseInt(newEl.style.top.replace("px", "")) : parseInt(el.top.replace("px", ""))
        var bottom_parsed = isContainerOrGroup ? parseInt(newEl.style.top.replace("px", "")) : parseInt(el.top.replace("px", ""))
      }

      leftX = (leftX === null || (left_parsed < leftX)) ? left_parsed : leftX
      rightX = (rightX === null || (right_parsed > rightX)) ? right_parsed : rightX
      topY = (topY === null || (top_parsed > topY)) ? top_parsed : topY
      bottomY = (bottomY === null || (bottom_parsed < bottomY)) ? bottom_parsed : bottomY
      heightY = (heightY === null || (height_parsed > heightY)) ? height_parsed : heightY
      lowestContainerHeightY = (topY === null || (top_parsed > topY)) ? height_parsed : heightY
      widthX = widthX + width_parsed

    }
  }
  const isGroup = el.type == "group"
  const coords = {
    left: leftX,
    width: rightX - leftX,
    top: isGroup ? bottomY : topY,
    height: isGroup ? topY - bottomY + lowestContainerHeightY: heightY
  }
  return coords
}

function initConnections(instance, toolConnections){
    toolConnections.forEach(con => {
      const conAnchors = [con.anchor1, con.anchor2]
      const processedAnchors = conAnchors.map(anchor =>
           [anchor.x,
           anchor.y,
           0,
           0,
           0,
           0])
      const con1 = instance.connect({
         source: con.anchor1.elementId,
         target: con.anchor2.elementId,
         ...endpointConfig,
         anchors: processedAnchors,
         overlays:[]
    })
  })
}

export function initContainers(instance, toolContent){
  toolContent.map((el, i) => {
    if(el.type == "container") {

      /*source container*/
      const container_source_id = el.id
      const container_source_coords = getContainerCoords(toolContent, el)

      var source = document.getElementById(container_source_id);
      const innerElements = findInnerElements(toolContent, el)
      innerElements.forEach(el_inner => {
        const parent = el
        if(el_inner && parent.type === "container"){
          const innerElement = document.getElementById(el_inner.id)
          if(innerElement){
            source.appendChild(innerElement)
            innerElement.classList.remove("tool-box-el-hack")
          }
        }
      });

      if(el.type !== "container"){
        if(!source.style.width && !source.style.height){
          source.style.width = container_source_coords.width+2*PADDING+'px';
          source.style.height = container_source_coords.height+2*PADDING+'px';
        }
      } else {
        if(!source.style.left && !source.style.top){
          source.style.left = container_source_coords.left-PADDING+'px';
          source.style.top = container_source_coords.top-PADDING+'px';
        }
      }
    }
  })
}

function createEndpoints(instance, toolContent, endpointConfig){
  toolContent.forEach((el, i) => {
    if(el.type == "container" || el.type == "group") {
      for (var ii = 0;ii<4;ii++){
        const endpoint = instance.addEndpoint(el.id, { anchor: anchors[ii]}, endpointConfig);
        endpoint.bind("dblclick", function(info) {
         info.connections.forEach(connection => {
           instance.deleteConnection(connection)
         })
        });
      }
    }
  })

  return instance
}

export function revalidate(instance, elementId, leftTop){
  const element = document.getElementById(elementId)
  const orgLeft = element.style.left
  const orgTop = element.style.top
  const newLeft = (parseFloat(orgLeft) + parseFloat(element.dataset.x)) + "px"
  const newTop = (parseFloat(orgTop) +  parseFloat(element.dataset.y)) + "px"
  element.style.left = newLeft
  element.style.top = newTop
  instance.revalidate(elementId)
  element.style.left = orgLeft
  element.style.top = orgTop
}

export function updatePosses(instance, toolContent){
  toolContent.map((el, i) => {
    instance.removeFromAllPosses(el.id)
    const uuid = Utils.uuidv4()
    if(el.type == "group") {
      const container_source_id = el.id
      instance.addToPosse([container_source_id], uuid); // TODO uuid
    }
    const innerElements = findInnerElements(toolContent, el)
    innerElements.forEach(el_inner => {
      const parent = el
      if(el_inner && parent.type === "group"){
        instance.addToPosse(el_inner.id, {id: uuid,active:false})
      }
    })
  })

  //TODO POSSE for close button
  /*
  const closeSelector = "#logo_2_close"
  console.log("UPDATE_POSSES")
  console.log(jsPlumb.getSelector(closeSelector))
  instance.draggable(jsPlumb.getSelector(closeSelector))
  instance.setDraggable(jsPlumb.getSelector(closeSelector), false);
  instance.addToPosse(["logo_2"], "aa"); // TODO uuid
  instance.addToPosse("logo_2_close", {id: "aa",active:false})
  */

}

export function onlyToggleDraggable(instance, selector_id, editMode){
  instance.setDraggable(selector_id, editMode);
}
export function toggleDraggable(instance, selector, editMode, toolContent, callBackOnStop){
  instance.draggable(jsPlumb.getSelector(selector), {
    start: function(e){
      const tempLogo = document.getElementById(e.el.id)
      const parentNode = tempLogo.parentNode
      if(e.el.id.includes("logo") && parentNode.id.includes("container")){
        const parentParentNode = tempLogo.parentNode.parentNode
        parentNode.removeChild(tempLogo)
        instance.revalidate(parentNode.id)
        parentParentNode.appendChild(tempLogo)
      }
    },
    stop: function(e){
      const tempLogo = document.getElementById(e.el.id)
      const sourceToolId = e.el.id
      var newlyJoinedTools = null
      if(e.el.id.includes("logo")){
        const toolBoxElements = document.getElementsByClassName('tool-box-el')
        const containerId = Serialization.getEnclosingContainerId(toolBoxElements, tempLogo)
        const targetToolId = Serialization.getEnclosingToolId(toolBoxElements, tempLogo)
        if(containerId !== null){
          document.getElementById(containerId).appendChild(tempLogo)
          instance.revalidate(containerId)
        } else if(targetToolId !== null){
           newlyJoinedTools = [sourceToolId, targetToolId]
          const targetToolDom = document.getElementById(targetToolId)
          const sourceToolDom = document.getElementById(sourceToolId)
          const sourceToolLeft = sourceToolDom.style.left
          sourceToolDom.style.left = (parseInt(sourceToolLeft) + targetToolDom.width + PADDING) + "px"
          //addContainer
          //document.getElementById(containerId).appendChild(tempLogo)
          //instance.revalidate(containerId)
        }
      }
      callBackOnStop(newlyJoinedTools)
    },
  /*grid:[5,5]*/});
  instance.setDraggable(jsPlumb.getSelector(selector), editMode);

  const connectionsPre = instance.getAllConnections()
  const connections = connectionsPre.map(a => Object.assign({}, a));
  const anchors = connections.map(a => {
    return {id: a.id, anchor1: a.endpoints[0].anchor, anchor2: a.endpoints[1].anchor}
  });

  instance.deleteEveryEndpoint()
  const config = editMode ? endpointConfigEditable : endpointConfig

  createEndpoints(instance, toolContent, config)

  const elementsHavingEndpoints = []
  connections.forEach(con => {
    const conAnchor = anchors.find(a => a.id == con.id)
    const conAnchors = [conAnchor.anchor1, conAnchor.anchor2]
    const processedAnchors = conAnchors.map(anchor =>
         [anchor.x,
         anchor.y,
         anchor.getOrientation()[0],
         anchor.getOrientation()[1],
         anchor.offsets[0],
         anchor.offsets[1]])
    const con1 = instance.connect({
       source: con.sourceId,
       target: con.targetId,
       ...config,
       anchors: processedAnchors,
       overlays:[]
     })

     /*
     const label = con1.getOverlay("label");
     label.setLabel("BAR");
     */
     elementsHavingEndpoints.push(con.sourceId)
     elementsHavingEndpoints.push(con.targetId)
   })

   const toolContentFiltered = toolContent.filter(el => elementsHavingEndpoints.findIndex(endpoint => endpoint == el.id) < 0)

}

export function detachElement(instance, id){
  instance.deleteConnectionsForElement(id);
  instance.removeAllEndpoints(id);
}

export function initFlows(toolContent, toolConnections) {

  var instance = jsPlumb.getInstance({
          ...instanceConfig
    });

    initContainers(instance, toolContent)
    initConnections(instance, toolConnections)

    const canvas = document.getElementById("ToolBox")
    jsPlumb.on(canvas, "dblclick", function(e) {
      //alert("dblclick")
      //newNode(e.offsetX, e.offsetY);
    });
    instance.bind("click", function (con,e) {
      //Below working
      /*var inField = document.createElement("input")
      canvas.parentNode.insertBefore(inField, canvas);
      inField.classList.add('connectorInputField');
      inField.style.left = con.canvas.style.left
      inField.style.top = con.canvas.style.top*/

      //canvas.attributes.width.value

      /*c.addOverlay(
       [ "Label", {label:"+", id:"+", labelStyle:{fill: "white", color:"black"}}]);
       c.addOverlay(
       [ "Arrow", {
          location: 1, //0
          direction: 1, //-1
          paintStyle: { stroke: "black" },
          width: 10,
          id: "arrow",
          length: 10,
          foldback: 0.1}
      ])*/
    });

    /*instance.bind("connection", function (info, originalEvent) {
        alert(info.connection);
    });
    instance.bind("connectionMoved", function (info, originalEvent) {
        alert(info.connection);
    });
    instance.bind("dblclick",function(info, originalEvent){
      alert("efd")
      //instance.remove(this);
    });

    instance.bind("connectionDetached", function (info, originalEvent) {
        alert(info.connection, true);
    });*/


    instance = createEndpoints(instance, toolContent, endpointConfig)

    return instance
  }
