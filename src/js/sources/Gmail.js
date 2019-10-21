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
    new Item(
      "Gmail",
      ItemTypes.EMAIL,
      "Email from person 1",
      "Hi this is person 1",
      "https://www.gmail.com/email",
      "2019-01-14T22:42:28+0000"
    ),
    new Item(
      "Gmail",
      ItemTypes.EMAIL,
      "Spam from crappy business",
      "Yeah it's true, we suck",
      "https://www.gmail.com/email",
      "2019-04-14T22:43:34+0000"
    )
  );

  return tasks;
}

export default Gmail;
