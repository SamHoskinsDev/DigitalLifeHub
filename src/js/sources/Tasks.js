import React from "react";
import { Item, ItemTypes } from "../DigitalLifeHub";

const apiRootURL = "https://digitallifehub-f9b6.restdb.io/rest/tasks";
const apiKey = "5db332537db96665d0675082"; // Full access: "4d64d69d0deb90ede169feb31b71329d8925e"

function Tasks() {
  return (
    <div className="items items--tasks">
      <h2>Gmail</h2>
    </div>
  );
}

export async function getTasks() {
  // Gets all tasks from the database
  return await fetch(apiRootURL, {
    method: "GET",
    headers: {
      "cache-control": "no-cache",
      "x-apikey": apiKey
    }
  })
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
            completed: taskJSON.completed,
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
      return [];
    });
}

export async function createTask(task) {
  // Adds an item to the database
  return await fetch(apiRootURL, {
    method: "POST",
    headers: {
      "cache-control": "no-cache",
      "x-apikey": apiKey,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      content: task.content,
      date: task.date,
      associated_item_id: task.associatedItemId,
      completed: task.completed
    })
  })
    .then(function(response) {
      if (response && response.ok) {
        task.onItemChecked = function(checked) {
          onItemChecked(this, checked);
        };
        return task;
      }
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
