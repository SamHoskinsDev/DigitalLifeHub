import React, { Component } from "react";
import * as Helper from "./Helper";
//import logo from "../assets/images/logo.svg";
import "../css/main.scss";
//import Gmail from "./gmail/Gmail";
import {
  Wunderlist,
  getTasks as getWunderlistTasks
} from "./sources/Wunderlist";

var Sugar = require("sugar");

/*
TODO:
  Create a central "Event" object
  - This can be a Wunderlist item, an email, a message in Slack, etc
  - This should be actionable
	  - Add task text
    - Checkbox so it's checkable
  - Icon to allow opening the Event's URL in a new tab
*/

export class EventItem {
  source = "";
  id = "";
  type = "";
  title = "";
  content = "";
  url = "";
  date = "";
  completed = "";
  tasks = [];

  constructor(
    source = "",
    id = "",
    type = "",
    title = "",
    content = "",
    url = "",
    date = "", // ISO8601 formatted
    completed = false
  ) {
    this.source = source;
    this.id = id;
    this.type = type;
    this.title = title;
    this.content = content;
    this.url = url;
    this.date = date;
    this.completed = completed;
  }

  addEventTask(eventTask) {
    this.tasks.push(eventTask);
  }
}
class EventTask {
  constructor(task) {
    this.task = task;
  }
}

class DigitalLifeHub extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filters: null,
      events: null
    };
  }

  displayEvents() {
    if (!this.state.events) {
      this.getEvents();
      return;
    }
  }

  async getEvents() {
    let events = [];

    // TODO: Get Gmail "Events"
    events.push(
      new EventItem(
        "Gmail",
        1,
        "Email",
        "Email from person 1",
        "Hi this is person 1",
        "https://www.gmail.com/email",
        "2019-05-15T20:20:27.000Z"
      ),
      new EventItem(
        "Gmail",
        2,
        "Email",
        "Spam from crappy business",
        "Yeah it's true, we suck",
        "https://www.gmail.com/email",
        "2019-05-15T20:20:21.000Z"
      )
    );

    // TODO: Add a generic and reliable way to pull tasks from a "source"/"service" (eg Wunderlist, Gmail, etc)
    //const tasks = Wunderlist.getTasks();

    // TODO: Get Wunderlist "Events"

    const wunderlistTasks = await getWunderlistTasks();
    events = events.concat(wunderlistTasks);
    /*
    events.push(
      new EventItem(
        "Wunderlist",
        1,
        "Download a movie",
        "https://www.wunderlist.com/task",
        1557951623
      ),
      new EventItem(
        "Wunderlist",
        2,
        "Buy milk",
        "https://www.wunderlist.com/task",
        1557951625
      )
    );
    */

    // Sorts the Events by most recent
    events = events.sort(function(event1, event2) {
      return Sugar.Date.isBefore(
        Sugar.Date.create(event1.date),
        Sugar.Date.create(event2.date)
      );
    });

    // TODO: Update list of filters
    const filters = [...new Set(events.map(x => x.source))];

    this.setState({ filters, events });
  }

  componentDidMount() {
    this.displayEvents();
  }

  render() {
    return (
      <div className="hub">
        <h1>Events</h1>
        {/* TODO: Add a filter bar, that allows selection of sources based on what's pulled in via "getEvents()" */}
        <Filters filters={this.state.filters} />
        <Events events={this.state.events} />

        <Wunderlist />
      </div>
    );
  }
}

class Filters extends Component {
  render() {
    console.log(this.props);
    return (
      // TODO: Move the "this.props.filters" check outside of the "<ul>", and don't output any content when there are no items
      this.props.filters && (
        <ul className="filters">
          {this.props.filters.map((filter, index) => (
            <Filter key={index} filter={filter} />
          ))}
        </ul>
      )
    );
  }
}

class Filter extends Component {
  render() {
    console.log(this.props);
    const filterId = Helper.generateUniqueId();

    return (
      <li>
        <label htmlFor={filterId}>
          <input
            type="checkbox"
            name="filter"
            id={filterId}
            value={this.props.filter}
          />
          {this.props.filter}
        </label>
      </li>
    );
  }
}

class Events extends Component {
  render() {
    return (
      // TODO: Move the "this.props.events" check outside of the "<ul>", and output a different message when there are no items
      <ul className="events">
        {this.props.events &&
          this.props.events.map((event, index) => (
            <Event key={index} event={event} />
          ))}
      </ul>
    );
  }
}

class Event extends Component {
  addTask(event) {
    // Prompts the user to enter a task
    const task = window.prompt(`${event.source} - Add task`);

    // TODO: Add task based on "event" entity
    alert(task);
  }

  render() {
    const sanitizedSource = Helper.toDashedLower(this.props.event.source);
    const eventDateTime = this.props.event.date
      ? Sugar.Date.create(this.props.event.date)
      : null;
    const relativeDateTime = eventDateTime
      ? Sugar.Date.relative(eventDateTime)
      : null;

    return (
      <li className={`event event--${sanitizedSource}`}>
        <input type="checkbox" className="event__checkbox" />
        <img
          src={require(`../assets/images/logos/${sanitizedSource}.png`)}
          alt={`${this.props.event.source} icon`}
          className="event__source-icon"
        />
        <div className="event__details">
          {this.props.event.title && (
            <span className="event__title">{this.props.event.title}</span>
          )}
          <span className="event__content">{this.props.event.content}</span>
        </div>
        {relativeDateTime && (
          <span className="event__date">{relativeDateTime}</span>
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
        {/* TODO: Output the "tasks" on this item, in the same way that I output the initial list of "events" */}
      </li>
    );
  }
}

export default DigitalLifeHub;
