import * as CONSTANTS from '../constants'

export const actionSetFlowInstance = (payload) => {
  console.log(CONSTANTS.ACTION_SET_FLOW_INSTANCE)
  return {
    type: CONSTANTS.ACTION_SET_FLOW_INSTANCE,
    payload
  }
}

export const actionSetToolContent = (payload) => {
  console.log(CONSTANTS.ACTION_SET_TOOL_CONTENT)
  console.log(payload)
  return {
    type: CONSTANTS.ACTION_SET_TOOL_CONTENT,
    payload
  }
}

export const test = (payload) => {
  return {
    type: "TEST",
    payload
  }
}
