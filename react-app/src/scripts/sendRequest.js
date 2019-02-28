const baseUrl = process.env.REACT_APP_API_URL; // custom env var must start with REACT_APP_

const handleErrors = response => {
    const errors = [400, 401, 500];
    if (!response.ok && !errors.includes(response.status)) {
        console.error(response);
        throw Error(response);
    } else {
        return response;
    }
};

const sendRequest = async (
    body,
    endpoint,
    additionalHeaders = {},
    method = "POST"
) => {
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
        const resp = handleErrors(await fetch(url, options));
        return await resp.json();
    } catch (e) {
        return { error: "Something went wrong, try again later." };
    }
};

export default sendRequest;
