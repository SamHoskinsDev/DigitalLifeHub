import React from "react";
import { Item, ItemTypes } from "../DigitalLifeHub";

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
      title: "Email from person 1",
      content: "Hi this is person 1",
      url: "https://www.gmail.com/email",
      date: "2019-01-14T22:42:28+0000",
      onItemChecked: function(checked) {
        onItemChecked(this, checked);
      }
    }),
    new Item({
      source: "Gmail",
      type: ItemTypes.EMAIL,
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
