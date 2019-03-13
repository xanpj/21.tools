import * as CONSTANTS from '../constants'

export const actionSetFlowInstance = (payload) => {
  console.log(CONSTANTS.ACTION_SET_FLOW_INSTANCE)
  return {
    type: CONSTANTS.ACTION_SET_FLOW_INSTANCE,
    payload
  }
}
