export const setAccessToken = accessToken => {
  return {
    type: "SET_ACCESS_TOKEN",
    accessToken
  };
};

export const setRefreshToken = refreshToken => {
  return {
    type: "SET_REFRESH_TOKEN",
    refreshToken
  };
};

export const setInfoText = infoText => {
  return {
    type: "SET_INFO_TEXT",
    infoText
  };
};
