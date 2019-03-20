import * as CONSTANTS from '../constants'
import * as UTILS from '../utils'

const defaultState = {
  flowInstance: null,
  toolContent: null,
  toolContentHash: null
}

export default (state = defaultState, action) => {
  switch (action.type) {
    case CONSTANTS.ACTION_SET_FLOW_INSTANCE:
      return {
        ...state,
        flowInstance: action.payload
      }
    case CONSTANTS.ACTION_SET_TOOL_CONTENT:
      return {
        ...state,
        toolContent: action.payload
      }
    case CONSTANTS.ACTION_ADD_TOOL_ELEMENT:
      if(state.toolContent !== null){
        const newToolContent = state.toolContent
        newToolContent.push(action.payload)
        console.log(newToolContent)
        return {
          ...state,
          toolContent: newToolContent
        }
      }
    case CONSTANTS.ACTION_DELETE_TOOL_ELEMENT:
      if(state.toolContent !== null){
        var newToolContent = state.toolContent
        const refId = action.payload
        const elIndex = newToolContent.findIndex(el => el.id === refId)
        var foundInContainer = false
        if(elIndex > -1){
          const containerCleanedContent = newToolContent.map(el => {
            var newEl = el
            if(el.type=="container"){
              var contents = el.content.split(",").map(el => el.trim())
              console.log(contents)
              const elIndex = contents.indexOf(refId)
              contents.splice(elIndex, 1)
              if(elIndex > -1){
                foundInContainer = true
                newEl = {...el, content: contents.join(",")}
              }
            }
            return newEl
          })
          newToolContent = containerCleanedContent
          if(!foundInContainer){
            newToolContent.splice(elIndex,1)
          }
          console.log(newToolContent)
          const toolContentHash = UTILS.md5(JSON.stringify(newToolContent))
          console.log(toolContentHash)
          return {
            ...state,
            toolContent: newToolContent,
            toolContentHash: toolContentHash
          }
        }
      }
    default:
      return state;
  }
};
