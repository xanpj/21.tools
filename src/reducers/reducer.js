import * as CONSTANTS from '../constants'
import * as Utils from '../utils'

const defaultState = {
  flowInstance: null,
  toolContent: null,
  toolConnections: null,
  toolContentHash: null,
  toolboxHeader: null
}

export default (state = defaultState, action) => {
  switch (action.type) {
    case CONSTANTS.ACTION_SET_TOOLBOX_HEADER:
      return {
        ...state,
        toolboxHeader: action.payload
      }
    case CONSTANTS.ACTION_SET_FLOW_INSTANCE:
      return {
        ...state,
        flowInstance: action.payload
      }
    case CONSTANTS.ACTION_SET_TOOL_CONTENT:
      return {
        ...state,
        toolContent: action.payload.toolContent /* || state.toolContent*/,
        toolConnections: action.payload.toolConnections || state.toolConnections // TODO check if working with ||
      }
    case CONSTANTS.ACTION_ADD_TOOL_ELEMENT:
      if(state.toolContent !== null){
        const newToolContent = state.toolContent
        newToolContent.push(action.payload)
        const toolContentHash = Utils.md5(JSON.stringify(newToolContent))


        return {
          ...state,
          toolContent: newToolContent,
          toolContentHash: toolContentHash
        }
      }
    case CONSTANTS.ACTION_DELETE_TOOL_ELEMENT:
      if(state.toolContent !== null){
        var newToolContent = state.toolContent
        const refId = action.payload
        const elIndex = newToolContent.findIndex(el => el.id === refId)
        var foundInContainer = false
        const deleteElements = []
        if(elIndex > -1){
          const containerCleanedContent = newToolContent.map((el, i) => {
            var newEl = el
            if(el.type=="container"){
              var contents = el.content.split(",").map(el => el.trim())

              const elIndex = contents.indexOf(refId)
              contents.splice(elIndex, 1)
              if(elIndex > -1){
                if(contents.length > 0){
                  foundInContainer = true
                  newEl = {...el, content: contents.join(",")}
                } else {
                  deleteElements.push(i)
                }
              }
            }
            return newEl
          })
          newToolContent = containerCleanedContent
          //deleteElements.forEach(elId => newToolContent.splice(elId,1))
          if(!foundInContainer){
            newToolContent.splice(elIndex,1)
          }
          const toolContentHash = Utils.md5(JSON.stringify(newToolContent))
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
