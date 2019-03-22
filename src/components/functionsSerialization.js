import * as Utils from '../utils'

const PADDING = 10

function getElementFrames(toolBoxElements, containers){
  return Array.from(toolBoxElements).map((el, i) => {
    if((!el.parentElement.id.includes("container") && !containers)  //exclude logos already embedded in containers
      || (el.id.includes("container") && containers) ){
      const isText = el.id.includes("text")
      const isImg = el.id.includes("logo")
      const isContainer = el.id.includes("container")
      return {
        id: el.id,
        top: parseInt(el.style.top.replace("px", "")),
        left: parseInt(el.style.left.replace("px", "")),
        width: (isText || isImg || isContainer) ? (isText || isContainer ? el.offsetWidth : el.width) : parseInt(el.style.width.replace("px", "")),
        height: (isText || isImg || isContainer) ? (isText || isContainer?  el.offsetHeight : el.height) : parseInt(el.style.height.replace("px", ""))
    }
  } else return null
  }).filter(el => el !== null)
}

export function getEnclosingToolId(toolBoxElements, sourceEl){
  var toolId = null

  const top = parseInt(sourceEl.style.top.replace("px", ""))
  const left = parseInt(sourceEl.style.left.replace("px", ""))
  const right = left + sourceEl.width
  const height = sourceEl.height

  //check if the current logo (el) fits in some container (elContainer)
  Array.from(toolBoxElements).forEach(targetEl => {
    if(targetEl.id.includes("logo") && (targetEl.id !== sourceEl.id)){
      const targetElDom = document.getElementById(targetEl.id)
      const targetElTop = parseInt(targetElDom.style.top.replace("px", ""))
      const targetElLeft= parseInt(targetElDom.style.left.replace("px", ""))
      const targetElRight = targetElLeft + targetElDom.width
      const targetElHeight = targetElDom.height
      if(left > (targetElLeft - 10)
        && right < (targetElRight + 10)
        && top > (targetElTop - 10)
        && (top + height) < (targetElTop + targetElHeight + 10)){
          toolId = targetEl.id
        }
    }
  })
  return toolId
}

export function getEnclosingContainerId(toolBoxElements, el){
  const retrieveOnlyContainers = true
  const toolBoxContainerFrames = getElementFrames(toolBoxElements, retrieveOnlyContainers)

  const top = parseInt(el.style.top.replace("px", ""))
  const left = parseInt(el.style.left.replace("px", ""))
  const right = left + el.width
  const height = el.height

  var containerId = null
  const isImg = el.id.includes("logo")
  if(isImg){
    //check if the current logo (el) fits in some container (elContainer)
    toolBoxContainerFrames.forEach(elContainer => {
      if(left > elContainer.left
        && right < (elContainer.left + elContainer.width)
        && top > (elContainer.top)
        && (top + height) < (elContainer.top + elContainer.height)){
          containerId = elContainer.id
        }
    })
  }
  return containerId
}

export function serializeToolBoxElements(orgToolContent, toolBoxElements, newlyJoinedTools = null){
  const retrieveOnlyContainers = false
  const toolBoxElementsFrames = getElementFrames(toolBoxElements, retrieveOnlyContainers)

  const toolBoxElementsArr = Array.from(toolBoxElements)
  const toolBoxElementsToSerialized = toolBoxElementsArr.map((el, i) => {
    var elInformation = {
      id: el.id,
      left: el.style.left,
      top: el.style.top,
      width: el.style.width,
      height: el.style.height,
      content: "",
      outer: "",
      type: ""
    }
    if(el.parentNode.id.includes("container")){
      const orgElement = orgToolContent.find(orgEl => orgEl.id == el.parentNode.id)
      console.log("orgElement")
      console.log(orgElement)
      const orgLeft = parseFloat(orgElement.left)
      const orgTop = parseFloat(orgElement.top)
      console.log("el.parentNode")
      console.log(el.parentNode)
      const newLeft = parseFloat(el.parentNode.style.left)
      const newTop =  parseFloat(el.parentNode.style.top)
      console.log(newLeft)
      console.log(orgLeft)
      console.log()
      console.log(newTop)
      console.log(orgTop)
      console.log()
      console.log(elInformation.left)
      console.log(elInformation.top)
      elInformation.left = parseFloat(elInformation.left) - (orgLeft - newLeft) + "px"
      elInformation.top = parseFloat(elInformation.top) - (orgTop - newTop) + "px"
      console.log(elInformation.left)
      console.log(elInformation.top)
    }

    const top = parseInt(elInformation.top.replace("px", ""))
    const left = parseInt(elInformation.left.replace("px", ""))
    const right = left + parseInt(elInformation.width.replace("px", ""))
    const height = parseInt(elInformation.height.replace("px", ""))

    const isImg = el.id.includes("logo")
    const isContainer = el.id.includes("container")
    const isGroup = el.id.includes("group")
    const isText = el.id.includes("text")

    if(isImg || isText) {
      elInformation.type = isImg ? "img" : "text"
      const correspondingElement = orgToolContent.filter(el => el.id == elInformation.id)
      if(correspondingElement && correspondingElement.length > 0){
        elInformation.content = correspondingElement[0].content
      }
    }
    else if(isContainer) {
      elInformation.type = "container"
      //insert container children if they are DOM children
      Array.from(el.children).forEach(childEl => {
        elInformation.content += childEl.id + ","
      })
    }
    else if(isGroup) {
      elInformation.type = "group"

      //insert any fitting elements (elChild) to the current group (el)
      const toolBoxElementsFramesLength = toolBoxElementsFrames.length
      toolBoxElementsFrames.forEach(elChild => {
        if(elChild.left > left
          && (elChild.left + elChild.width) < right
          && (elChild.top) > top
          && (elChild.top + elChild.height) < (top + height)){
            elInformation.content += elChild.id + ","
          }
      })
    }
    elInformation.content = elInformation.content.replace(/,\s*$/, "");
    return elInformation
  })

  if(newlyJoinedTools){
    const newlyJoinedToolsElements = toolBoxElementsArr.filter(el => newlyJoinedTools.indexOf(el.id) > -1)
    newlyJoinedTools.reverse()
    var elInformation = {
      id: "container_"+ Utils.uuidv4(),
      left: newlyJoinedToolsElements[1].style.left - PADDING,
      top: newlyJoinedToolsElements[1].style.top - PADDING,
      width: "",
      height: "",
      content: newlyJoinedTools.join(","),
      outer: "",
      type: "container"
    }
    console.log("newlyJoinedTools")
    toolBoxElementsToSerialized.push(elInformation)
  }

  function idSort(a,b) {
    if(a.type == b.type){
      if (parseInt(a.id.split("_")[1]) >= parseInt(b.id.split("_")[1])){
        return 1
      }
      else {
        return -1
      }
    }
  }
  const toolBoxElementsToSerializedFinal = [toolBoxElementsToSerialized.filter(el => el.type == "img").sort(idSort),
                                      toolBoxElementsToSerialized.filter(el => el.type == "text").sort(idSort),
                                      toolBoxElementsToSerialized.filter(el => el.type == "container").sort(idSort),
                                      toolBoxElementsToSerialized.filter(el => el.type == "group").sort(idSort)]
  return toolBoxElementsToSerializedFinal.flat()
}
