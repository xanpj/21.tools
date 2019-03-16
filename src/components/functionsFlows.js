import * as Serialization from './functionsSerialization'

const jsPlumb = window.jsPlumb
const LOGO_SIZE = 30

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


function makeFlow(init_id, init_coords, outer_id, outer_coords){
  var firstInstance = jsPlumb.getInstance();
}

function findInnerElements(toolContent, el) {
  var inner_elements_ids = el.content.split(",")
  inner_elements_ids = inner_elements_ids.map((inner_el_id, i) => inner_el_id.trim())
  return toolContent.filter((inner_el, i) => inner_elements_ids.findIndex(el_id => el_id === inner_el.id) > -1)
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
      var width_parsed = isContainerOrGroup ? parseInt(document.getElementById(el.id).style.width.replace("px", "")) : document.getElementById(el.id).offsetWidth
      var height_parsed = isContainerOrGroup ? parseInt(document.getElementById(el.id).style.height.replace("px", "")) : document.getElementById(el.id).offsetHeight
      var left_parsed = isContainerOrGroup ? parseInt(document.getElementById(el.id).style.left.replace("px", "")) : parseInt(el.left.replace("px", ""))
      var right_parsed = left_parsed + (width_parsed)
      var top_parsed = isContainerOrGroup ? parseInt(document.getElementById(el.id).style.top.replace("px", "")) : parseInt(el.top.replace("px", ""))
      var bottom_parsed = isContainerOrGroup ? parseInt(document.getElementById(el.id).style.top.replace("px", "")) : parseInt(el.top.replace("px", ""))

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


function initContainers(instance, toolContent){
  const PADDING = 10
  toolContent.map((el, i) => {
    if(el.type == "container" || el.type == "group") {

      /*source container*/
      const container_source_id = el.id
      const container_source_coords = getContainerCoords(toolContent, el)

      var source = document.getElementById(container_source_id);
      const innerElements = findInnerElements(toolContent, el)
      innerElements.forEach(el_inner => {
        const parent = el
        if(el_inner && parent.type !== "group"){
          const innerElement = document.getElementById(el_inner.id)
          source.appendChild(innerElement)
          innerElement.classList.remove("tool-box-el-hack")
        }
      });

      if(el.type  != "container" ){
        source.style.width = container_source_coords.width+2*PADDING+'px';
        source.style.height = container_source_coords.height+2*PADDING+'px';
      }
      source.style.left = container_source_coords.left-PADDING+'px';
      source.style.top = container_source_coords.top-PADDING+'px';

      /*target container*/
      var nodes = el.outer.split(",")
      nodes = nodes.map((el, i) => el.trim())
      nodes.forEach(node => {
        var container_target = (node) ? toolContent.find(target => target.id == node) : null
        if(container_target) {
          const container_target_id = container_target.id
          const container_target_coords = getContainerCoords(toolContent, container_target)
          var target = document.getElementById(container_target_id)
          /*target.style.left = container_target_coords.left+'px';
          target.style.width = container_target_coords.width+'px';
          target.style.top = container_target_coords.top+'px';
          target.style.height = container_target_coords.height+'px';*/
          makeFlow(container_source_id, container_source_coords, container_target_id, container_target_coords)
        }
      })
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

export function toggleDraggable(instance, selector, editMode, toolContent, callBackOnStop){


  //instance.addToPosse(["group_0", "container_1"], "possew");
  //instance.addToPosse("container_0", {id:"possew",active:true})

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
      if(e.el.id.includes("logo")){
        const toolBoxElements = document.getElementsByClassName('tool-box-el')
        //iterate through all container_source_id
        const containerId = Serialization.getEnclosingContainerId(toolBoxElements, tempLogo)
        //if container is found in which element fits --> insert as child
        if(containerId !== null){
          document.getElementById(containerId).appendChild(tempLogo)
          instance.revalidate(containerId)
        }
      }
      callBackOnStop()
    },
    grid:[5,5]});
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

   toolContent.map((el, i) => {
     if(el.type == "group") {
       const container_source_id = el.id
       //instance.addToPosse(["group_0", "container_1"], "possew");
       instance.addToPosse([container_source_id], "possew"); // TODO uuid
     }
     const innerElements = findInnerElements(toolContent, el)
     innerElements.forEach(el_inner => {
       const parent = el
       if(el_inner && parent.type === "group"){
         instance.addToPosse(el_inner.id, {id:"possew",active:false})
       }
     })
   })
   //instance.addToPosse(["group_0", "container_1"], "possew");
   //instance.addToPosse("container_0", {id:"possew",active:true})
}

export function initFlows(toolContent) {

  var instance = jsPlumb.getInstance({
          ...instanceConfig
    });

    initContainers(instance, toolContent)

    const canvas = document.getElementById("ToolBox")
    jsPlumb.on(canvas, "dblclick", function(e) {
      alert("created")
        //newNode(e.offsetX, e.offsetY);
    });
    instance.bind("click", function (con,e) {
      var inField = document.createElement("input")
      canvas.parentNode.insertBefore(inField, canvas);
      inField.classList.add('connectorInputField');
      //canvas.attributes.width.value
      inField.style.left = con.canvas.style.left
      inField.style.top = con.canvas.style.top

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
