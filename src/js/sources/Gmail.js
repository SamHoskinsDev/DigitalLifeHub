import React from "react";
import { Item, ItemTypes } from "../DigitalLifeHub";

const Sugar = require("sugar");

// TODO: Fill this component like Wunderlist.js

function Gmail() {
  return (
    <div className="items items--gmail">
      <h2>Gmail</h2>
    </div>
  );
}

export async function getTasks() {
  const tasks = [];

  tasks.push(
    new Item({
      source: "Gmail",
      type: ItemTypes.EMAIL,
      unread: true,
      sender: "Person 1",
      title: "Email from person 1 today",
      content: "Hi this is person 1",
      url: "https://www.gmail.com/email",
      date: Sugar.Date.create("now").toISOString(),
      onItemChecked: function(checked) {
        onItemChecked(this, checked);
      }
    }),
    new Item({
      source: "Gmail",
      type: ItemTypes.EMAIL,
      unread: false,
      sender: "Person 1",
      title: "Email from person 1 yesterday",
      content: "Hi this is person 1",
      url: "https://www.gmail.com/email",
      date: Sugar.Date.create("yesterday").toISOString(),
      onItemChecked: function(checked) {
        onItemChecked(this, checked);
      }
    }),
    new Item({
      source: "Gmail",
      type: ItemTypes.EMAIL,
      unread: false,
      sender: "Crappy business",
      title: "Spam from crappy business",
      content: "Yeah it's true, we suck",
      url: "https://www.gmail.com/email",
      date: "2019-04-14T22:43:34+0000",
      onItemChecked: function(checked) {
        onItemChecked(this, checked);
      }
    })
  );

  return tasks;
}

function onItemChecked(item, checked) {
  if (!item) {
    return;
  }

  item.completed = checked;
  alert(
    `Gmail.js | "${item.source}" - "${item.content}" completed: ${item.completed}`
  );
}

export default Gmail;
