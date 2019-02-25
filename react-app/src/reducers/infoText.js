const infoText = (state = '', action) => {
  switch (action.type) {
    case 'SET_INFO_TEXT':
      return action.infoText;
    default:
      return state;
  }
};

export default infoText;
