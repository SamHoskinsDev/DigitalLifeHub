import React, { Component } from "react";
import "../../css/wunderlist.scss";
//var request = require("request");
//var WunderlistSDK = require("wunderlist");
var WunderlistAPI = require("wunderlist-api");

const clientId = "9f849690dd28219bded5";
const accessToken =
  "67d4da9edfbb1c332dda4d49d7ca1ca412b24a973e5926d40d4775c4875d";

const redirectUrl = "http://localhost:3000/wunderlist_api";
const randomString =
  Math.random()
    .toString(36)
    .substring(2, 15) +
  Math.random()
    .toString(36)
    .substring(2, 15);
//const authorizationUrl = `https://www.wunderlist.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUrl}&state=${randomString}`;

class Wunderlist extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: null
    };
  }

  connect() {
    var wunderlistAPI = new WunderlistAPI({
      clientId: clientId,
      accessToken: accessToken
    });

    wunderlistAPI
      .getLists()
      .then(response => {
        console.log(response);
      })
      .catch(error => {
        console.log(error);
      });
  }

  render() {
    return (
      <div className="hubs__hub hub__wunderlist">
        <h2>Wunderlist</h2>
        <p>Not connected</p>
        <div onClick={this.connect}>Connect</div>
        <div>Data: {this.state.data}</div>
      </div>
    );
  }
}

export default Wunderlist;
