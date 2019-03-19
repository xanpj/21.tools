import * as CONSTANTS from '../constants'

const defaultState = {
  flowInstance: null,
  toolContent: null,
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
    default:
      return state;
  }
};
