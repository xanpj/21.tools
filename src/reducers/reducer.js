import * as CONSTANTS from '../constants'

const defaultState = {
  flowInstance: null
}

export default (state = defaultState, action) => {
  switch (action.type) {
    case CONSTANTS.ACTION_SET_FLOW_INSTANCE:
      return {
        flowInstance: action.payload
      };
    default:
      return state;
  }
};
