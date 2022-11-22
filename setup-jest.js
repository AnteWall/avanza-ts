const nock = require("nock");

beforeAll(() => {
  nock.disableNetConnect();
});
afterAll(() => {
  nock.enableNetConnect();
});
