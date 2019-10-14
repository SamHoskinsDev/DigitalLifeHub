import React, { Component } from "react";
import * as Helper from "./Helper";
// import logo from "../assets/images/logo.svg";
import "../css/main.scss";
// import Gmail from "./gmail/Gmail";
// import Wunderlist from "./sources/Wunderlist";
import {
  Wunderlist,
  getTasks as getWunderlistTasks
} from "./sources/Wunderlist";

const Sugar = require("sugar");

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

export class Event {
  showTasks = false;

  constructor(source, type, title, content, url, date, completed, id = 0) {
    this.source = source;
    this.type = type;
    this.title = title;
    this.content = content;
    this.url = url;
    this.date = date;
    this.completed = completed;

    // TODO: Make this a proper ID
    this.id =
      id !== 0
        ? id
        : Helper.encrypt(
            `${this.source}-${this.title}-${this.content}-${this.timestamp}`
          );
  }
}

// TODO: Re-enable this(?)
/*
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
*/

class Task {
  checked = false;

  constructor(content, date, eventId = 0) {
    this.content = content;
    this.date = date;
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

  async getEvents() {
    let events = [];

    // TODO: Get Gmail "Events"
    events.push(
      new Event(
        "Gmail",
        "Email",
        "Email from person 1",
        "Hi this is person 1",
        "https://www.gmail.com/email",
        "2019-01-14T22:42:28+0000"
      ),
      new Event(
        "Gmail",
        "Email",
        "Spam from crappy business",
        "Yeah it's true, we suck",
        "https://www.gmail.com/email",
        "2019-04-14T22:43:34+0000"
      )
    );

    // TODO: Add a generic and reliable way to pull tasks from a "source"/"service" (eg Wunderlist, Gmail, etc)
    //const tasks = Wunderlist.getTasks();

    // TODO: Get Wunderlist "Events"

    const wunderlistTasks = await getWunderlistTasks();
    events = events.concat(wunderlistTasks);
    /*
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
    */

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
      new Task("Do the thing (Mar)", "2019-03-14T22:43:25+0000"),
      new Task("Do the other thing (Jun)", "2019-07-14T22:43:59+0000"),
      new Task(
        "Do the Gmail thing (Sep)",
        "2019-02-14T22:43:06+0000",
        "9837d49eb0c2a01002a8aed357c0ae09"
      ),
      new Task(
        "Do the Gmail thing (Aug)",
        "2019-08-14T19:45:32+0000",
        "9837d49eb0c2a01002a8aed357c0ae09"
      ),
      new Task(
        "Do the Wunderlist thing (Jul)",
        "2019-06-14T22:43:45+0000",
        "6c7f774f"
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

      // TODO: Currently this excludes Tasks if a source is checked

      // Filters the Events and Tasks based on the selected filters
      eventsAndTasks = eventsAndTasks.filter(
        event =>
          sourcesToDisplay.length === 0 ||
          sourcesToDisplay.includes(event.source)
      );

      console.log("SORTING");
      // TODO: Fix sorting - currently it's not doing anything
      // Sorts the Events and Tasks by most recent
      eventsAndTasks = eventsAndTasks.sort(function(
        eventOrTaskA,
        eventOrTaskB
      ) {
        console.log("sorting", eventOrTaskA.date + " vs " + eventOrTaskB.date);
        return Sugar.Date.isBefore(
          Sugar.Date.create(eventOrTaskA.date),
          Sugar.Date.create(eventOrTaskB.date)
        );
      });

      /*
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
      */
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
    this.props.addTask(new Task(task, Sugar.Date.now(), event.id));
  }

  render() {
    const sanitizedSource = Helper.toDashedLower(this.props.event.source);
    const eventDateTime = this.props.event.date
      ? Sugar.Date.create(this.props.event.date)
      : null;
    console.log(this.props.event.date);
    const relativeDateTime = eventDateTime
      ? Sugar.Date.relative(eventDateTime)
      : null;

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
            <span className="event__date">{`${relativeDateTime} [${Sugar.Date.format(
              eventDateTime,
              "{dd}/{MM}"
            )}]`}</span>
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
    const taskDateTime = this.props.task.date
      ? Sugar.Date.create(this.props.task.date)
      : null;
    const relativeDateTime = taskDateTime
      ? Sugar.Date.relative(taskDateTime)
      : null;

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
          <span className="task__date">{`${relativeDateTime} [${Sugar.Date.format(
            taskDateTime,
            "{dd}/{MM}"
          )}]`}</span>
        )}
      </li>
    );
  }
}

export default DigitalLifeHub;
