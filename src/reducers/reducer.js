import * as CONSTANTS from '../constants'

const defaultState = {
  flowInstance: null,
  toolContent: null
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
    default:
      return state;
  }
};
