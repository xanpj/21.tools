function getElementFrames(toolBoxElements, containers){
  return Array.from(toolBoxElements).map((el, i) => {
    if((!el.parentElement.id.includes("container") && !containers)  //exclude logos already embedded in containers
      || (el.id.includes("container") && containers) ){
      const isText = el.id.includes("text")
      const isImg = el.id.includes("logo")
      const isContainer = el.id.includes("container")
      console.log("el")
      console.log(el)
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

export function getEnclosingContainerId(toolBoxElements, el){
  const retrieveOnlyContainers = true
  const toolBoxContainerFrames = getElementFrames(toolBoxElements, retrieveOnlyContainers)
  console.log("toolBoxContainerFrames")
  console.log(toolBoxContainerFrames)
  const top = parseInt(el.style.top.replace("px", ""))
  const left = parseInt(el.style.left.replace("px", ""))
  const right = left + el.width
  const height = el.height
  console.log(top)
  console.log(left)
  console.log(right)
  console.log(height)

  var containerId = null
  const isImg = el.id.includes("logo")
  if(isImg){
    //check if the current logo (el) fits in some container (elContainer)
    toolBoxContainerFrames.forEach(elContainer => {
      console.log("elContainer")
      console.log(elContainer)
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

export function serializeToolBoxElements(toolBoxElements){
  const retrieveOnlyContainers = false
  const toolBoxElementsFrames = getElementFrames(toolBoxElements, retrieveOnlyContainers)

  const toolBoxElementsToSerialized = Array.from(toolBoxElements).map((el, i) => {
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
    const top = parseInt(elInformation.top.replace("px", ""))
    const left = parseInt(elInformation.left.replace("px", ""))
    const right = left + parseInt(elInformation.width.replace("px", ""))
    const height = parseInt(elInformation.height.replace("px", ""))

    const isImg = el.id.includes("logo")
    const isContainer = el.id.includes("container")
    const isGroup = el.id.includes("group")
    const isText = el.id.includes("text")

    if(isImg) {
      elInformation.type = "img"
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
      toolBoxElementsFrames.forEach(elChild => {
        if(elChild.left > left
          && (elChild.left + elChild.width) < right
          && (elChild.top) > top
          && (elChild.top + elChild.height) < (top + height)){
            elInformation.content += elChild.id + ","
          }
      })
    }
    else if(isText) {
      elInformation.type = "text"
    }
    return elInformation
  })

  return toolBoxElementsToSerialized
}
