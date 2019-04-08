import * as CONSTANTS from '../constants'

export const actionSetFlowInstance = (payload) => {
  return {
    type: CONSTANTS.ACTION_SET_FLOW_INSTANCE,
    payload
  }
}

export const actionSetToolContent = (payload) => {
  return {
    type: CONSTANTS.ACTION_SET_TOOL_CONTENT,
    payload
  }
}

export const actionAddToolElement = (payload) => {
  return {
    type: CONSTANTS.ACTION_ADD_TOOL_ELEMENT,
    payload
  }
}

export const actionDeleteToolElement = (payload) => {
  return {
    type: CONSTANTS.ACTION_DELETE_TOOL_ELEMENT,
    payload
  }
}

export const actionSetToolboxHeader = (payload) => {
  return {
    type: CONSTANTS.ACTION_SET_TOOLBOX_HEADER,
    payload
  }
}
