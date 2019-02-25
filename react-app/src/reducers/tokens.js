const initialState = {
  accessToken: null,
  refreshToken: null,
};

const tokens = (state = initialState, action ) => {
  switch (action.type) {
    case 'SET_ACCESS_TOKEN':
      return {...state, accessToken: action.accessToken};
    case 'SET_REFRESH_TOKEN':
      return {...state, refreshToken: action.refreshToken};
    default:
      return state;
  }
};

export default tokens
