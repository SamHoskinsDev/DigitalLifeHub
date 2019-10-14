import React, { Component } from "react";
import * as Helper from "./Helper";
// import logo from "../assets/images/logo.svg";
import "../css/main.scss";
// import Gmail from "./gmail/Gmail";
// import Wunderlist from "./sources/Wunderlist";

var Sugar = require("sugar");

/*
var express = require("express");
require("dotenv").config();
DigitalLifeHub.use("/public", express.static(__dirname + "/public"));
require("./lib/routes.js")(DigitalLifeHub);
DigitalLifeHub.listen("port");
*/

/*
TODO:
  Create a central "Event" object
  - This can be a Wunderlist item, an email, a message in Slack, etc
  - This should be actionable
	  - Add task text
    - Checkbox so it's checkable
  - Icon to allow opening the Event's URL in a new tab
*/

// TODO: I've used "this.forceUpdate()" a few times (mainly in checkboxes) - find a better way to handle that

class Event {
  tasks = {};
  showTasks = false;
  checked = false;

  constructor(source, title, content, url, timestamp, id = 0) {
    this.source = source;
    this.title = title;
    this.content = content;
    this.url = url;
    this.timestamp = timestamp;

    // TODO: Make this a proper ID
    this.id =
      id !== 0
        ? id
        : Helper.encrypt(
            `${this.source}-${this.title}-${this.content}-${this.timestamp}`
          );
  }
}

class Task {
  checked = false;

  constructor(content, timestamp, eventId = 0) {
    this.content = content;
    this.timestamp = timestamp;
    this.eventId = eventId;
  }
}

class Filter {
  checked = false;

  constructor(name) {
    this.name = name;
  }
}

class DigitalLifeHub extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filters: null,
      events: null,
      tasks: null
    };
  }

  displayEvents() {
    if (!this.state.events) {
      this.getEvents();
      return;
    }
  }

  getEvents() {
    let events = [];

    // TODO: Get Gmail "Events"
    events.push(
      new Event(
        "Gmail",
        "",
        "This is the content (Jan)",
        "https://www.gmail.com/email",
        1547494963
      ),
      new Event(
        "Gmail",
        "Spam from crappy business (Apr)",
        "This is the content",
        "https://www.gmail.com/email",
        1555271044
      )
    );

    // TODO: Add a generic and reliable way to pull tasks from a "source"/"service" (eg Wunderlist, Gmail, etc)
    //const tasks = Wunderlist.getTasks();

    // TODO: Get Wunderlist "Events"
    events.push(
      new Event(
        "Wunderlist",
        "",
        "This is the content (Feb)",
        "https://www.wunderlist.com/task",
        1550173406
      ),
      new Event(
        "Wunderlist",
        "Buy milk (May)",
        "This is the content",
        "https://www.wunderlist.com/task",
        1557863064
      )
    );

    // TODO: Also add Filters for "Types" (eg "Event", "Task", etc)
    // Builds a list of Filters
    const filters = [];
    const filterNames = [...new Set(events.map(event => event.source))];
    filterNames.forEach(filterName => {
      filters.push(new Filter(filterName));
    });

    this.setState({ filters, events });
  }

  displayTasks() {
    if (!this.state.tasks) {
      this.getTasks();
      return;
    }
  }

  getTasks() {
    let tasks = [];

    // TODO: Get "Tasks"
    tasks.push(
      new Task("Do the thing (Mar)", 1552592628),
      new Task("Do the other thing (Jun)", 1560541485),
      new Task(
        "Do the Gmail thing (Sep)",
        1568490339,
        "04df061bc011e28911ffabefaf001080"
      ),
      new Task(
        "Do the Gmail thing (Aug)",
        1565811932,
        "04df061bc011e28911ffabefaf001080"
      ),
      new Task(
        "Do the Wunderlist thing (Jul)",
        1563133524,
        "3d81a0f86193d8c92188bcfd58d25c4c"
      )
    );

    this.setState({ tasks });
  }

  componentDidMount() {
    this.displayEvents();
    this.displayTasks();
  }

  render() {
    return (
      <div className="hub">
        <h1>Events</h1>
        <FiltersComponent
          filters={this.state.filters}
          onChange={() => this.forceUpdate()}
        />
        <EventsAndTasksComponent
          events={this.state.events}
          tasks={this.state.tasks}
          filters={this.state.filters}
          onCompleted={eventOrTask => {
            // TODO: Add logic for a task being checked off
            alert(`"${eventOrTask.content}" completed`);
          }}
          addTask={task => {
            // Adds a new Task
            this.state.tasks.push(task);
            this.forceUpdate();
          }}
        />

        {/* <Wunderlist /> */}
      </div>
    );
  }
}

class FiltersComponent extends Component {
  render() {
    return (
      this.props.filters && (
        <ul className="filters">
          {this.props.filters.map((filter, index) => (
            <FilterComponent
              key={index}
              filter={filter}
              onChange={this.props.onChange}
            />
          ))}
        </ul>
      )
    );
  }
}

class FilterComponent extends Component {
  render() {
    const filterId = Helper.generateUniqueId();

    return (
      <li>
        <label htmlFor={filterId}>
          <input
            type="checkbox"
            name="filter"
            id={filterId}
            value={this.props.filter.name}
            onChange={event => {
              this.props.filter.checked = event.target.checked;
              this.props.onChange();
            }}
          />
          {this.props.filter.name}
        </label>
      </li>
    );
  }
}

class EventsAndTasksComponent extends Component {
  render() {
    // Gets a list of sources to display
    const sourcesToDisplay = [];
    if (this.props.filters) {
      this.props.filters.forEach(filter => {
        if (filter.checked) {
          sourcesToDisplay.push(filter.name);
        }
      });
    }

    // Sorts the Events and Tasks by most recent
    let eventsAndTasks = this.props.events;
    if (eventsAndTasks) {
      // Adds all Tasks
      const eventlessTasks = this.props.tasks.filter(
        task => task.eventId === 0
      );
      eventsAndTasks = eventsAndTasks.concat(eventlessTasks);

      // Filters the Events and Tasks based on the selected filters
      eventsAndTasks = eventsAndTasks.filter(
        event =>
          sourcesToDisplay.length === 0 ||
          sourcesToDisplay.includes(event.source)
      );

      console.log("SORTING");
      // Sorts the Events and Tasks by most recent
      eventsAndTasks = eventsAndTasks.sort(function(
        eventOrTaskA,
        eventOrTaskB
      ) {
        return (
          parseFloat(eventOrTaskB.timestamp) -
          parseFloat(eventOrTaskA.timestamp)
        );
      });
    }

    return (
      <>
        {eventsAndTasks && (
          <ul className="events-and-tasks">
            {eventsAndTasks.map((eventOrTask, index) => (
              <>
                {eventOrTask.constructor.name === "Event" && (
                  <EventComponent
                    key={index}
                    event={eventOrTask}
                    tasks={this.props.tasks.filter(
                      task => task.eventId === eventOrTask.id
                    )}
                    onCompleted={eventOrTask =>
                      this.props.onCompleted(eventOrTask)
                    }
                    addTask={task => this.props.addTask(task)}
                  />
                )}

                {eventOrTask.constructor.name === "Task" && (
                  <TaskComponent
                    key={index}
                    task={eventOrTask}
                    onCompleted={eventOrTask =>
                      this.props.onCompleted(eventOrTask)
                    }
                  />
                )}
              </>
            ))}
          </ul>
        )}
        {!eventsAndTasks && <span>No events found</span>}
      </>
    );
  }
}

class EventComponent extends Component {
  addTask(event) {
    // Prompts the user to enter a task
    let task = window.prompt(`${event.source} - Add task`);

    // TODO: Sanitize the task text so no one can inject scripts
    task = task.trim();

    // Checks if the task is still valid
    if (!task) {
      return;
    }

    // Adds a new Task
    this.props.addTask(new Task(task, Helper.getCurrentTimestamp(), event.id));
  }

  render() {
    const sanitizedSource = Helper.toDashedLower(this.props.event.source);
    const eventDateTime = Sugar.Date.create(this.props.event.timestamp * 1000);
    const relativeDateTime = Sugar.Date.relative(eventDateTime);

    return (
      <>
        <li className={`event event--${sanitizedSource}`}>
          <input
            type="checkbox"
            className="event__checkbox"
            onChange={() => {
              this.props.onCompleted(this.props.event);
            }}
          />
          <img
            src={require(`../assets/images/logos/${sanitizedSource}.png`)}
            alt={`${this.props.event.source} icon`}
            className="event__source-icon"
          />
          <div className="event__details">
            {this.props.event.title && (
              <span className="event__title">{this.props.event.title}</span>
            )}
            {this.props.event.content && (
              <span className="event__content">{this.props.event.content}</span>
            )}
            <span style={{ fontSize: "x-small" }}>
              ID: {this.props.event.id}
            </span>
          </div>
          {relativeDateTime && (
            <span className="event__date">{relativeDateTime}</span>
          )}
          {this.props.tasks.length > 0 && (
            <span
              className="event__show-tasks"
              onClick={() => {
                this.props.event.showTasks = !this.props.event.showTasks;
                this.forceUpdate();
              }}
            >
              v
            </span>
          )}
          <span
            className="event__add-task"
            onClick={() => this.addTask(this.props.event)}
          >
            +
          </span>
          <a
            href={this.props.event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="event__url"
          >
            >
          </a>
        </li>

        {this.props.event.showTasks && (
          <ul className="event-tasks">
            {this.props.tasks.map((task, index) => (
              <TaskComponent
                key={index}
                task={task}
                onCompleted={eventOrTask => this.props.onCompleted(eventOrTask)}
              />
            ))}
          </ul>
        )}
      </>
    );
  }
}

class TaskComponent extends Component {
  render() {
    const sanitizedSource = Helper.toDashedLower(this.props.task.source);
    const taskDateTime = Sugar.Date.create(this.props.task.timestamp * 1000);
    const relativeDateTime = Sugar.Date.relative(taskDateTime);

    return (
      <li
        className={`task${sanitizedSource ? " task--${sanitizedSource}" : ""}`}
      >
        <input
          type="checkbox"
          className="task__checkbox"
          onChange={() => {
            this.props.onCompleted(this.props.task);
          }}
        />
        {/* TODO: Put an element here to keep conformity in spacing with Events */}
        <div className="task__details">
          {this.props.task.title && (
            <span className="task__title">{this.props.task.title}</span>
          )}
          {this.props.task.content && (
            <span className="task__content">{this.props.task.content}</span>
          )}
        </div>
        {relativeDateTime && (
          <span className="task__date">{relativeDateTime}</span>
        )}
      </li>
    );
  }
}

export default DigitalLifeHub;
