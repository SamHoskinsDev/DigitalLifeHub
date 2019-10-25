import React from "react";
import { Item, ItemTypes } from "../DigitalLifeHub";

const apiOptions = {
  mode: "cors",
  method: "GET",
  headers: {
    "cache-control": "no-cache",
    "x-apikey": "4d64d69d0deb90ede169feb31b71329d8925e"
  }
};

function Tasks() {
  return (
    <div className="items items--tasks">
      <h2>Gmail</h2>
    </div>
  );
}

export async function getTasks() {
  // Gets all tasks from the database
  return await fetch(
    "https://digitallifehub-f9b6.restdb.io/rest/tasks",
    apiOptions
  )
    .then(function(response) {
      return response.json();
    })
    .then(function(tasksJSON) {
      const tasks = [];

      tasksJSON.forEach(function(taskJSON) {
        tasks.push(
          new Item({
            source: "Task",
            type: ItemTypes.TASK,
            content: taskJSON.content,
            date: taskJSON.date,
            associatedItemId: taskJSON.associated_item_id,
            onItemChecked: function(checked) {
              onItemChecked(this, checked);
            }
          })
        );
      });

      return tasks;
    })
    .catch(function(error) {
      console.log("error", error);
    });
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
