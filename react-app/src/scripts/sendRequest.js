const baseUrl = process.env.REACT_APP_API_URL; // custom env var must start with REACT_APP_


export default class Request {
  /**
   * Sends requests to baseUrl/enpoint, with supplied parameters
   * @param body
   * @param endpoint
   * @param additionalHeaders
   * @param method
   * @return {Promise<*>}
   */
  static async sendRequest(
    body,
    endpoint,
    additionalHeaders = {},
    method = "POST"
  ) {
    const url = baseUrl + endpoint;
    const headers = {
      ...{ "Content-Type": "application/json" },
      ...additionalHeaders
    };
    const options = {
      method: method,
      mode: "cors",
      headers: headers,
      body: JSON.stringify(body)
    };
    try {
      const resp = Request.handleErrors(await fetch(url, options));
      return await resp.json();
    } catch (e) {
      return { error: "Something went wrong, try again later." };
    }
  }

  static handleErrors = response => {
    const errors = [400, 401, 500];
    if (!response.ok && !errors.includes(response.status)) {
      console.error(response);
      throw Error(response);
    } else {
      return response;
    }
  };

  /**
   * Sends translation requests
   * @param sourceLang
   * @param targetLang
   * @param text
   * @param accessToken
   * @returns {Promise<*>}
   */
  static async translation(sourceLang, targetLang, text, accessToken) {
    const headers = { Authorization: `Bearer ${accessToken}` };
    const body = { text: text, to: targetLang, from: sourceLang };
    const response = await Request.sendRequest(body, "translate", headers);
    if (response.error) {
      if (response.error === 'Internal server error') {
        return {message: response.error, success: false}
      } else {
        return {message: "Invalid token", success: false}
      }
    } else if (response.text) {
      return {message: response.text, success: true}
    }
    return {message: 'Internal server error', success: false}
  }

  /**
   * Sends logout requests to invalidate access and refresh tokens
   * @param accessToken
   * @param refreshToken
   * @returns {Promise<void>}
   */
  static async logout(accessToken, refreshToken) {
    const headers = { Authorization: `Bearer ${accessToken}` };
    await Request.sendRequest({}, "logout/access", headers);
    headers["Authorization"] = `Bearer ${refreshToken}`;
    await Request.sendRequest({}, "logout/refresh", headers);
  }

  static async refreshAccessToken(refreshToken) {
    const resp = await Request.sendRequest({}, "token/refresh", {
    Authorization: `Bearer ${refreshToken}`
    });
    return {success: !!resp.access_token, accessToken: resp.access_token}
  }
}
