import React from "react";
//import logo from "../assets/images/logo.svg";
import "../css/main.scss";
import Gmail from "./gmail/Gmail";
import Wunderlist from "./wunderlist/Wunderlist";

/*
var express = require("express");
require("dotenv").config();
DigitalLifeHub.use("/public", express.static(__dirname + "/public"));
require("./lib/routes.js")(DigitalLifeHub);
DigitalLifeHub.listen("port");
*/

function DigitalLifeHub() {
  return (
    <div className="hubs">
      <Gmail />
      <Wunderlist />
    </div>
  );
}

export default DigitalLifeHub;
