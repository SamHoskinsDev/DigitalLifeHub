import React, { Component } from "react";
import "../../css/wunderlist.scss";
//var request = require("request");
//var WunderlistSDK = require("wunderlist");
var WunderlistAPI = require("wunderlist-api");

const clientId = "9f849690dd28219bded5";
const accessToken =
  "67d4da9edfbb1c332dda4d49d7ca1ca412b24a973e5926d40d4775c4875d";
const wunderlistAPI = new WunderlistAPI({
  clientId: clientId,
  accessToken: accessToken
});

/*
const redirectUrl = "http://localhost:3000/wunderlist_api";
const randomString =
  Math.random()
    .toString(36)
    .substring(2, 15) +
  Math.random()
    .toString(36)
    .substring(2, 15);
const authorizationUrl = `https://www.wunderlist.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUrl}&state=${randomString}`;
*/

class Wunderlist extends Component {
  constructor(props) {
    super(props);

    this.state = {
      listsData: null,
      tasksData: null,
      recentTasksData: null
    };
  }

  displayTasks() {
    if (!this.state.tasksData) {
      this.getTasks();
      return;
    }
  }

  getLists() {
    wunderlistAPI
      .getLists()
      .then(response => {
        const listsData = JSON.parse(response.body);

        this.setState({ listsData });
      })
      .then(() => {
        this.getTasks();
      })
      .catch(error => {
        console.log(error);
      });
  }

  getTasks() {
    if (!this.state.listsData) {
      this.getLists();
      return;
    }

    for (let i = 0; i < this.state.listsData.length; i++) {
      const listData = this.state.listsData[i];

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

          //console.log(this.state);
        })
        .catch(error => {
          console.log(error);
        });
    }
  }

  componentDidMount() {
    this.displayTasks();
  }

  render() {
    return (
      <div className="hubs__hub hub__wunderlist">
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
      <ul>
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
    return <li className="lists__list">{this.props.task.title} </li>;
  }
}

export default Wunderlist;
