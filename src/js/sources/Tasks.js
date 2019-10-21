import React from "react";
import { Item, ItemTypes } from "../DigitalLifeHub";

// TODO: Fill this component like Wunderlist.js

function Tasks() {
  return (
    <div className="items items--tasks">
      <h2>Gmail</h2>
    </div>
  );
}

export async function getTasks() {
  const tasks = [];

  tasks.push(
    new Item(
      "User",
      ItemTypes.TASK,
      "",
      "Do the thing (Mar)",
      "",
      "2019-03-14T22:43:25+0000"
    ),
    new Item(
      "User",
      ItemTypes.TASK,
      "",
      "Do the other thing (Jun)",
      "",
      "2019-07-14T22:43:59+0000"
    ),
    new Item(
      "User",
      ItemTypes.TASK,
      "",
      "Do the Gmail thing (Sep)",
      "",
      "2019-02-14T22:43:06+0000",
      false,
      0,
      "d1d7bf74fea7330d3acf8677e9303c09"
    ),
    new Item(
      "User",
      ItemTypes.TASK,
      "",
      "Do the Gmail thing (Aug)",
      "",
      "2019-08-14T19:45:32+0000",
      false,
      0,
      "d1d7bf74fea7330d3acf8677e9303c09"
    ),
    new Item(
      "User",
      ItemTypes.TASK,
      "",
      "Do the Wunderlist thing (Jul)",
      "",
      "2019-06-14T22:43:45+0000",
      false,
      0,
      "4d6d1da1"
    )
  );

  return tasks;
}

export default Tasks;
