import React, { Component } from "react";
var WunderlistAPI = require("wunderlist-api");

const clientId = "9f849690dd28219bded5";
const accessToken =
  "67d4da9edfbb1c332dda4d49d7ca1ca412b24a973e5926d40d4775c4875d";
const wunderlistAPI = new WunderlistAPI({
  clientId: clientId,
  accessToken: accessToken
});

class Wunderlist extends Component {
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

  displayTasks() {
    wunderlistAPI
      .getLists()
      .then(response => {
        return response;
      })
      .then(response => {
        const listsData = JSON.parse(response.body);

        for (let i = 0; i < listsData.length; i++) {
          const listData = listsData[i];

          wunderlistAPI
            .getTasks(listData.id)
            .then(response => {
              const listTasksData = JSON.parse(response.body);

              // Adds each task to the array
              let tasksData = this.state.tasksData || [];
              for (let i = 0; i < listTasksData.length; i++) {
                const listTaskData = listTasksData[i];
                tasksData.push(listTaskData);
              }

              // Sorts the list of tasks by latest
              tasksData = tasksData.sort(function(a, b) {
                return b.created_at.localeCompare(a.created_at);
              });

              // TODO: Add code to get only items from a certain timestamp

              this.setState({ tasksData });
            })
            .catch(error => {
              console.log(error);
            });
        }
      })
      .catch(error => {
        console.log(error);
      });
  }
  render() {
    return (
      <div className="events events--wunderlist">
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
      <ul className="events">
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
      <li className="events__event events__event--wunderlist">
        {this.props.task.title}{" "}
      </li>
    );
  }
}

export default Wunderlist;
