import React, { Component } from "react";
import * as Helper from "./Helper";
import "../css/main.scss";
import { /*Gmail,*/ getTasks as getGmailItems } from "./sources/Gmail";
import {
  /*Wunderlist,*/ getTasks as getWunderlistItems
} from "./sources/Wunderlist";
import { /*Tasks,*/ getTasks } from "./sources/Tasks";

const Sugar = require("sugar");

/*
TODO:
  Create a central "Item" object
  - This can be a Wunderlist item, an email, a message in Slack, etc
  - This should be actionable
	  - Add item text
    - Checkbox so it's checkable
    - "onChecked" function
*/

// TODO: I've used "this.forceUpdate()" a few times (mainly in checkboxes) - find a better way to handle that

export const ItemTypes = {
  EMAIL: "Email",
  TODO: "TODO",
  TASK: "Task"
};

export class Item {
  showSubItems = false;

  constructor(params) {
    this.source = params.source;
    this.type = params.type;
    this.title = params.title;
    this.content = params.content;
    this.url = params.url;
    this.date = params.date;
    this.completed = params.completed;
    this.associatedItemId = params.associatedItemId;
    this.onItemChecked = params.onItemChecked;

    this.id = params.id || this.generateId();
  }

  generateId() {
    // TODO: Make this a proper ID
    return Helper.encrypt(`${this.source}-${this.content}-${this.timestamp}`);
  }
}

class Filter {
  checked = true;

  constructor(name) {
    this.name = name;
  }
}

class DigitalLifeHub extends Component {
  constructor(props) {
    super(props);

    this.state = {
      items: null,
      sourceFilters: null,
      typeFilters: null
    };
  }

  displayItems() {
    if (!this.state.items) {
      this.getItems();
      return;
    }
  }

  async getItems() {
    let items = [];

    // Gets all Gmail items
    const gmailItems = await getGmailItems();
    items = items.concat(gmailItems);

    // Gets all Wunderlist items
    const wunderlistItems = await getWunderlistItems();
    items = items.concat(wunderlistItems);

    // Gets all Tasks items
    const tasksItems = await getTasks();
    items = items.concat(tasksItems);

    // Builds a list of source Filters
    const sourceFilters = [];
    const sources = [...new Set(items.map(item => item.source))];
    sources.forEach(source => {
      sourceFilters.push(new Filter(source));
    });

    // Builds a list of type Filters
    const typeFilters = [];
    const types = [...new Set(items.map(item => item.type))];
    types.forEach(type => {
      typeFilters.push(new Filter(type));
    });

    this.setState({ items, sourceFilters, typeFilters });
  }

  componentDidMount() {
    this.displayItems();
  }

  render() {
    return (
      <div className="hub">
        <h1>Items</h1>
        <div className="filters">
          <FiltersComponent
            title="Sources"
            filters={this.state.sourceFilters}
            onChange={() => this.forceUpdate()}
          />
          <FiltersComponent
            title="Types"
            filters={this.state.typeFilters}
            onChange={() => this.forceUpdate()}
          />
        </div>

        <ItemsComponent
          items={this.state.items}
          sourceFilters={this.state.sourceFilters}
          typeFilters={this.state.typeFilters}
          onChecked={(item, checked) => {
            // Handles the Item being checked
            item.onItemChecked && item.onItemChecked(checked);
          }}
          addItem={item => {
            // Adds a new Item
            this.state.items.push(item);
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
        <div className="filters__segment">
          <h3>{this.props.title}</h3>
          <ul>
            {this.props.filters.map((filter, index) => (
              <FilterComponent
                key={index}
                filter={filter}
                onChange={this.props.onChange}
              />
            ))}
          </ul>
        </div>
      )
    );
  }
}

class FilterComponent extends Component {
  render() {
    const filterId = Helper.generateUniqueId();
    const sanitizedSource = Helper.toDashedLower(this.props.filter.name);

    return (
      <li className="filters__filter">
        <label htmlFor={filterId}>
          <input
            type="checkbox"
            name="filter"
            id={filterId}
            value={this.props.filter.name}
            checked={this.props.filter.checked}
            onChange={event => {
              this.props.filter.checked = event.target.checked;
              this.props.onChange();
            }}
          />
          {/* {this.props.filter.name} */}
          <img
            src={require(`../assets/images/icons/${sanitizedSource}.png`)}
            title={this.props.filter.name}
            alt={`${this.props.filter.name} icon`}
            className={Helper.classNames({
              "filters__filter-icon": true,
              "filters__filter-icon--disabled": !this.props.filter.checked
            })}
          />
        </label>
      </li>
    );
  }
}

class ItemsComponent extends Component {
  render() {
    // Gets a list of sources to display
    let sourcesAreFiltered = false;
    const sourcesToDisplay = [];
    if (this.props.sourceFilters) {
      this.props.sourceFilters.forEach(filter => {
        if (filter.checked) {
          sourcesToDisplay.push(filter.name);
          return;
        }
        sourcesAreFiltered = true;
      });
    }

    // Gets a list of types to display
    let typesAreFiltered = false;
    const typesToDisplay = [];
    if (this.props.typeFilters) {
      this.props.typeFilters.forEach(filter => {
        if (filter.checked) {
          typesToDisplay.push(filter.name);
          return;
        }
        typesAreFiltered = true;
      });
    }

    let items = this.props.items;
    if (items) {
      // Filters Items based on the selected filters, also filtering out tasks that have an associated item
      items = items.filter(
        item =>
          !item.associatedItemId &&
          (!sourcesToDisplay || sourcesToDisplay.includes(item.source)) &&
          (!typesToDisplay || typesToDisplay.includes(item.type))
      );

      // Sorts the Items
      items = items.sort(function(itemA, itemB) {
        const order = "DESC";
        return order === "DESC"
          ? Sugar.Date.create(itemB.date) - Sugar.Date.create(itemA.date)
          : Sugar.Date.create(itemA.date) - Sugar.Date.create(itemB.date);
      });
    }

    const isFiltering = sourcesAreFiltered || typesAreFiltered;
    return (
      <>
        {/* Items list */}
        {items && items.length > 0 && (
          <ul className="items">
            {items.map((item, index) => (
              <>
                <ItemComponent
                  key={index}
                  item={item}
                  subItems={this.props.items.filter(
                    subItem => subItem.associatedItemId === item.id
                  )}
                  onChecked={(item, checked) =>
                    this.props.onChecked(item, checked)
                  }
                  addItem={item => this.props.addItem(item)}
                />
              </>
            ))}
          </ul>
        )}

        {/* "No items found" output */}
        {(!items || items.length === 0) && (
          <>
            <span>No {isFiltering ? "matching " : ""}items found</span>
          </>
        )}
      </>
    );
  }
}

class ItemComponent extends Component {
  addItem(item) {
    // Prompts the user to enter a item
    let task = window.prompt(`${item.source} - Add item`);

    // Sanitizes the task
    task = Helper.sanitizedString(task);

    // Checks if the task is still valid
    if (!task) {
      return;
    }

    // Adds a new Item
    this.props.addItem(
      new Item(
        "Task",
        ItemTypes.TASK,
        "",
        task,
        "",
        Sugar.Date.create("now"),
        false,
        null,
        item.id
      )
    );
  }

  render() {
    const sanitizedSource = Helper.toDashedLower(this.props.item.source);
    const itemDateTime = this.props.item.date
      ? Sugar.Date.create(this.props.item.date)
      : null;
    const relativeDateTime = itemDateTime
      ? Sugar.Date.relative(itemDateTime)
      : null;

    return (
      <>
        {/* Item details */}
        <li className={`item item--${sanitizedSource}`}>
          <input
            type="checkbox"
            className="item__checkbox"
            onChange={event => {
              this.props.onChecked(this.props.item, event.target.checked);
            }}
          />
          <img
            src={require(`../assets/images/icons/${sanitizedSource}.png`)}
            title={this.props.item.source}
            alt={`${this.props.item.source} icon`}
            className="item__source-icon"
          />
          <div className="item__details">
            {this.props.item.title && (
              <span className="item__title">{this.props.item.title}</span>
            )}
            {this.props.item.content && (
              <span className="item__content">{this.props.item.content}</span>
            )}
            <span style={{ fontSize: "x-small" }}>
              ID: {this.props.item.id}
            </span>
          </div>
          {relativeDateTime && (
            <span className="item__date">{`${relativeDateTime} [${Sugar.Date.format(
              itemDateTime,
              "{dd}/{MM}"
            )}]`}</span>
          )}
          <span
            className="item__show-items"
            onClick={() => {
              this.props.item.showSubItems = !this.props.item.showSubItems;
              this.forceUpdate();
            }}
          >
            {this.props.subItems.length > 0 &&
              `${this.props.subItems.length} task${
                this.props.subItems.length !== 1 ? "s" : ""
              } ${this.props.item.showSubItems ? "^" : "v"}`}
          </span>
          <span
            className="item__add-item"
            onClick={() => this.addItem(this.props.item)}
          >
            +
          </span>
          <a
            href={this.props.item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="item__url"
          >
            {this.props.item.url ? ">" : ""}
          </a>
        </li>

        {/* Sub items */}
        {this.props.item.showSubItems && (
          <ul className="item__sub-items">
            {this.props.subItems.map((item, index) => (
              <ItemComponent
                key={index}
                item={item}
                subItems={this.props.subItems.filter(
                  subItem => subItem.associatedItemId === item.id
                )}
                onChecked={(item, checked) =>
                  this.props.onChecked(item, checked)
                }
                addItem={item => this.props.addItem(item)}
              />
            ))}
          </ul>
        )}
      </>
    );
  }
}

export default DigitalLifeHub;
