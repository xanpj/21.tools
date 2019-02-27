const jsPlumb = window.jsPlumb
const LOGO_SIZE = 30

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
        console.log(el.id)
        console.log({
          width_parsed,height_parsed,left_parsed,right_parsed,top_parsed,bottom_parsed
        })
      leftX = (leftX === null || (left_parsed < leftX)) ? left_parsed : leftX
      rightX = (rightX === null || (right_parsed > rightX)) ? right_parsed : rightX
      topY = (topY === null || (top_parsed > topY)) ? top_parsed : topY
      bottomY = (bottomY === null || (bottom_parsed < bottomY)) ? bottom_parsed : bottomY
      heightY = (heightY === null || (height_parsed > heightY)) ? height_parsed : heightY
      lowestContainerHeightY = (topY === null || (top_parsed > topY)) ? height_parsed : heightY
      widthX = widthX + width_parsed
      console.log({
        widthX,heightY,leftX,rightX,topY,bottomY
      })
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


function initContainers(toolContent){
  const PADDING = 10
  toolContent.map((el, i) => {
    if(el.type == "container" || el.type == "group") {

      /*source container*/
      const container_source_id = el.id
      const container_source_coords = getContainerCoords(toolContent, el)
      console.log(el.type)
      console.log(container_source_coords)

      var source = document.getElementById(container_source_id);
      const innerElements = findInnerElements(toolContent, el)
      innerElements.forEach(el => {
        if(el){
          const innerElement = document.getElementById(el.id)
          source.appendChild(innerElement)
          innerElement.classList.remove("tool-box-el")
        }
      });
      source.style.left = container_source_coords.left-PADDING+'px';
      source.style.width = container_source_coords.width+2*PADDING+'px';
      source.style.top = container_source_coords.top-PADDING+'px';
      source.style.height = container_source_coords.height+2*PADDING+'px';

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
export function initFlows(toolContent) {
  initContainers(toolContent)

  var instance = jsPlumb.getInstance({
            DragOptions: { cursor: 'pointer', zIndex: 2000 },
            PaintStyle: { stroke: '#000' },
            EndpointHoverStyle: { fill: "black" },
            HoverPaintStyle: { stroke: "black" },
            EndpointStyle: { width: 20, height: 16, stroke: '#000' },
            Endpoint: "Rectangle",
            Anchors: ["TopCenter", "TopCenter"],
            Container: "canvas"
    });
    instance.bind("connection", function (info, originalEvent) {
        alert(info.connection);
    });
    instance.bind("connectionDetached", function (info, originalEvent) {
        alert(info.connection, true);
    });

    instance.draggable(jsPlumb.getSelector(".tool-box-el"));

    var exampleDropOptions = {
        tolerance: "touch",
        hoverClass: "dropHover",
        activeClass: "dragActive"
    };
    var exampleColor = "#000";
    var exampleEndpoint = {
        endpoint: ["Dot", { radius: 3 }],
        isSource: true,
        scope: "uno",
        paintStyle: { fill: exampleColor, opacity: 0.5 },
        connectorStyle: {
            strokeWidth: 1,
            stroke: exampleColor,
            dashstyle: "solid"
        },
        connector: "Straight",
        isTarget: true,
        dropOptions: exampleDropOptions,
        /*beforeDetach: function (conn) {
                    return "Detach connection?";
                },*/
        onMaxConnections: function (info) {
            alert("Cannot drop connection " + info.connection.id + " : maxConnections has been reached on Endpoint " + info.endpoint.id);
          }
    };
    var color2 = "#000";
    var exampleEndpoint2 = {
        endpoint: ["Dot", { radius: 3 }],
        isSource: true,
        scope: "uno",
        connectorStyle: { stroke: color2, strokeWidth: 6 },
        connector: ["straight", { curviness: 63 } ],
        isTarget: true,
        dropOptions: exampleDropOptions
    };

    var anchors = [
                [0.5, 0, 0, 0],
                [0, 0.5, 0, 0],
                [1, 0.5, 0, 0],
                [0.5, 1, 0, 0],
            ]
    var e1 = instance.addEndpoint('container_2', { anchor: anchors }, exampleEndpoint);
    var e1 = instance.addEndpoint("container_3", { anchor: anchors }, exampleEndpoint);
    }
