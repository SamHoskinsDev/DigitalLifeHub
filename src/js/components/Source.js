export default class Source {
  name = "";
  rootUrl = "";
  apiKey = "";
  clientId = "";
  accessToken = "";

  constructor(name, rootUrl, apiKey = "", clientId = "", accessToken = "") {
    this.name = name;
    this.rootUrl = rootUrl;
    this.apiKey = apiKey;
    this.clientId = clientId;
    this.accessToken = accessToken;
  }

  getEvents() {}
}
