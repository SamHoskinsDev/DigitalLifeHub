import React from "react";
import { Item, ItemTypes } from "../DigitalLifeHub";

const apiRootURL = "https://digitallifehub-f9b6.restdb.io/rest/tasks";
// const apiKey = "5db332537db96665d0675082";

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
    mode: "cors",
    method: "GET",
    headers: {
      "cache-control": "no-cache",
      "x-apikey": "4d64d69d0deb90ede169feb31b71329d8925e"
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
    });
}

export async function createTask(task) {
  // Adds an item to the database
  return await fetch(apiRootURL, {
    mode: "cors",
    method: "POST",
    headers: {
      "cache-control": "no-cache",
      "x-apikey": "4d64d69d0deb90ede169feb31b71329d8925e",
      "content-type": "application/json"
    },
    json: true,
    // TODO: This seems to be the incorrect way of doing this, and https://digitallifehub-f9b6.restdb.io/home/ is down now(?)
    body: {
      content: task.content,
      date: task.date,
      associated_item_id: task.associatedItemId,
      completed: task.completed
    }
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(response) {
      // TODO: TEST
      if (response && response.id) {
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
