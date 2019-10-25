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
    new Item({
      source: "Task",
      type: ItemTypes.TASK,
      content: "Do the thing",
      date: "2019-03-14T22:43:25+0000",
      onItemChecked: function(checked) {
        onItemChecked(this, checked);
      }
    }),
    new Item({
      source: "Task",
      type: ItemTypes.TASK,
      content: "Do the other thing",
      date: "2019-07-14T22:43:59+0000",
      onItemChecked: function(checked) {
        onItemChecked(this, checked);
      }
    }),
    new Item({
      source: "Task",
      type: ItemTypes.TASK,
      content: "Do the Gmail thing",
      date: "2019-02-14T22:43:06+0000",
      associatedItemId: "d1d7bf74fea7330d3acf8677e9303c09",
      onItemChecked: function(checked) {
        onItemChecked(this, checked);
      }
    }),
    new Item({
      source: "Task",
      type: ItemTypes.TASK,
      content: "Do the Gmail thing 2",
      date: "2019-08-14T19:45:32+0000",
      associatedItemId: "d1d7bf74fea7330d3acf8677e9303c09",
      onItemChecked: function(checked) {
        onItemChecked(this, checked);
      }
    }),
    new Item({
      source: "Task",
      type: ItemTypes.TASK,
      content: "Do the Wunderlist thing",
      date: "2019-06-14T22:43:45+0000",
      associatedItemId: "4d6d1da1",
      onItemChecked: function(checked) {
        onItemChecked(this, checked);
      }
    })
  );

  return tasks;
}

export function onItemChecked(item, checked) {
  if (!item) {
    return;
  }

  item.completed = checked;
  alert(
    `Tasks.js | "${item.source}" - "${item.content}" completed: ${item.completed}`
  );
}

export default Tasks;
