import sinon from 'sinon';

import Request from './sendRequest';

let resp;
let stub;

describe("Request.refreshAccessToken", () => {
  it("refreshAccessToken failed request", async () => {
    stub = sinon.stub(Request, "sendRequest")
      .returns({ access_token: undefined });

    resp = await Request.refreshAccessToken('456');
    expect(resp.success).toEqual(false);
    expect(resp.accessToken).toEqual(undefined);
    expect(stub.called).toEqual(true);
    stub.restore();
  });

  it("refreshAccessToken successful request", async () => {
    stub = sinon.stub(Request, "sendRequest")
      .returns({ access_token: '456' });
    resp = await Request.refreshAccessToken('456');
    expect(resp.success).toEqual(true);
    expect(resp.accessToken).toEqual('456');
    expect(stub.called).toEqual(true);
    stub.restore();
  });
});

describe("Request.logout", () => {
  it("calls Request.sendRequest twice", async () => {
    stub = sinon.stub(Request, "sendRequest")
      .returns({ access_token: undefined });
    await Request.logout('123', '456');
    sinon.assert.calledTwice(stub);
    stub.restore();
  });
});

describe("Request.translation", () => {
  it("Successful translation response", async () => {
    stub = sinon.stub(Request, 'sendRequest');
    stub.returns({ text: 'hello' });
    resp = await Request.translation('', '', '', '');
    expect(stub.callCount).toEqual(1);
    expect(resp).toEqual({message: 'hello', success: true});
    stub.restore()
  });

  it("should differentiate between invalid tokens and internal server errors upon failure"
    , async () => {
    stub = sinon.stub(Request, 'sendRequest');
    stub.onFirstCall().returns({ error: 'Internal server error' })
      .onSecondCall().returns({ error: 'Invalid token' });
    resp = await Request.translation('', '', '', '');
    expect(resp).toEqual({ message: 'Internal server error', success: false });
    resp = await Request.translation('', '', '', '');
    expect(resp).toEqual({ message: 'Invalid token', success: false });
    stub.restore();
  });
});
