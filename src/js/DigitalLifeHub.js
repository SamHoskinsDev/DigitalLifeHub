import React, { Component } from "react";
import * as Helper from "./Helper";
//import logo from "../assets/images/logo.svg";
import "../css/main.scss";
//import Gmail from "./gmail/Gmail";
import Wunderlist from "./sources/Wunderlist";

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

class EventItem {
  tasks = {};
  checked = false;

  constructor(source, id, name, url, timestamp) {
    this.source = source;
    this.id = id;
    this.name = name;
    this.url = url;
    this.timestamp = timestamp;
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

  getEvents() {
    let events = [];

    // TODO: Get Gmail "Events"
    events.push(
      new EventItem(
        "Gmail",
        1,
        "Email from person 1",
        "https://www.gmail.com/email",
        1557951627
      ),
      new EventItem(
        "Gmail",
        2,
        "Spam from crappy business",
        "https://www.gmail.com/email",
        1557951621
      )
    );

    // TODO: Get Wunderlist "Events"
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

    // Sorts the Events by most recent
    events = events.sort(function(a, b) {
      return parseFloat(b.timestamp) - parseFloat(a.timestamp);
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
    const eventDateTime = Sugar.Date.create(this.props.event.timestamp * 1000);
    const relativeDateTime = Sugar.Date.relative(eventDateTime);

    return (
      <li className={`event event--${sanitizedSource}`}>
        <input type="checkbox" className="event__checkbox" />
        {/* TODO: Add source icon */}
        <img
          src={require(`../assets/images/logos/${sanitizedSource}.png`)}
          alt={`${this.props.event.source} icon`}
          className="event__source-icon"
        />
        <span className="event__title">{this.props.event.name}</span>
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
