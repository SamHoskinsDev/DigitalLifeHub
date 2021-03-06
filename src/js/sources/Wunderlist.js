import React, { Component } from "react";
import { Item, ItemTypes } from "../DigitalLifeHub";
import * as Helper from "../Helper";

const Sugar = require("sugar");
const WunderlistAPI = require("wunderlist-api");

const clientId = "9f849690dd28219bded5";
const accessToken =
  "67d4da9edfbb1c332dda4d49d7ca1ca412b24a973e5926d40d4775c4875d";
const wunderlistAPI = new WunderlistAPI({
  clientId: clientId,
  accessToken: accessToken
});

export class Wunderlist extends Component {
  constructor(props) {
    super(props);

    this.state = {
      listsData: null,
      tasksData: null,
      recentTasksData: null
    };
  }

  componentDidMount() {
    this.displayTasks();
  }

  async displayTasks() {
    const tasksData = await getTasks();
    this.setState({ tasksData });
  }

  render() {
    return (
      <div className="items items--wunderlist">
        <h2>Wunderlist</h2>
        <div className="wunderlist__lists">
          Recent tasks: <Tasks tasks={this.state.tasksData} />
        </div>
      </div>
    );
  }
}

class Tasks extends Component {
  render() {
    return (
      <ul className="items">
        {this.props.tasks &&
          this.props.tasks.map((task, index) => (
            <Task key={index} task={task} />
          ))}
      </ul>
    );
  }
}

class Task extends Component {
  render() {
    return (
      <li className="items__item items__item--wunderlist">
        {this.props.task.title}{" "}
      </li>
    );
  }
}

export async function getTasks() {
  return await wunderlistAPI
    .getLists()
    .then(async response => {
      return response;
    })
    .then(async response => {
      const listsData = JSON.parse(response.body);

      let tasksData = [];
      for (let i = 0; i < listsData.length; i++) {
        const listData = listsData[i];

        const listTasks = await wunderlistAPI
          // TODO: Check the API for if I can pull only uncompleted tasks
          .getTasks(listData.id)
          .then(async response => {
            const listTasksData = JSON.parse(response.body);

            // Adds each task to the array
            let tasksData = [];
            for (let i = 0; i < listTasksData.length; i++) {
              const listTaskData = listTasksData[i];

              const source = "Wunderlist";
              const date = listTaskData.created_at;

              // Adds the Item to the list
              tasksData.push(
                new Item({
                  id: Helper.hash(`${source}-${date}`),
                  source: source,
                  type: ItemTypes.TODO,
                  content: listTaskData.title,
                  url: "", // TODO: Get a link to the task
                  date: date,
                  completed: listTaskData.completed,
                  onItemChecked: function(checked) {
                    onItemChecked(this, checked);
                  }
                })
              );
            }

            // Sorts the list of tasks by latest
            tasksData = tasksData.sort(function(task1, task2) {
              return Sugar.Date.isBefore(
                Sugar.Date.create(task1.date),
                Sugar.Date.create(task2.date)
              );
            });

            return tasksData;
          })
          .catch(error => {
            console.log(error);
          });

        // TODO: Check that we got valid data back in listTasksData

        // Full list of tasks from each list
        tasksData = tasksData.concat(listTasks);
      }

      return tasksData;
    })
    .catch(error => {
      console.log(error);
    });
}

function onItemChecked(item, checked) {
  if (!item) {
    return;
  }

  item.completed = checked;
  alert(
    `Wunderlist.js | "${item.source}" - "${item.content}" completed: ${item.completed}`
  );
}

export default Wunderlist;
