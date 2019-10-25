import React, { Component } from "react";
import * as Helper from "./Helper";
import "../css/main.scss";
import { ReactComponent as LoadingIcon } from "../assets/images/icons/loading.svg";
import { /*Gmail,*/ getTasks as getGmailItems } from "./sources/Gmail";
import {
  /*Wunderlist,*/ getTasks as getWunderlistItems
} from "./sources/Wunderlist";
import {
  //Tasks,
  getTasks,
  createTask
  //onItemChecked as onTaskItemChecked
} from "./sources/Tasks";

const classNames = require("classnames");
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

const itemOrder = "DESC";
const tasksOrder = "DESC";

export class Item {
  showSubItems = false;

  constructor(params) {
    this.source = params.source;
    this.type = params.type;
    this.unread = params.unread;
    this.sender = params.sender;
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
    return Helper.encrypt(
      `${this.source}-${this.title}-${this.content}-${this.date}`
    );
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
    // Loading
    if (!this.state.items) {
      return (
        <div className="loading">
          <div className="loading__icon">
            <LoadingIcon />
          </div>
        </div>
      );
    }

    // Regular UI
    return (
      <div className="hub">
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
            this.state.items.push(item);
            this.forceUpdate();
          }}
        />

        {/* <Wunderlist /> */}
        <img
          src={`https://cataas.com/cat?${Helper.generateUniqueId()}`}
          alt="Random cat"
          title="Random cat"
          style={{
            width: "auto",
            height: "250px",
            position: "absolute",
            top: 0,
            right: 0
          }}
        />
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
          <img
            src={require(`../assets/images/icons/${sanitizedSource}.png`)}
            title={this.props.filter.name}
            alt={`${this.props.filter.name} icon`}
            className={classNames("filters__filter-icon", {
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

    const itemsByDateRange = [];
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
        return itemOrder === "DESC"
          ? Sugar.Date.create(itemB.date) - Sugar.Date.create(itemA.date)
          : Sugar.Date.create(itemA.date) - Sugar.Date.create(itemB.date);
      });

      // Builds an array of Items split by their collective dates (e.g. "Today", "Yesterday", "March 2019", etc)
      items.forEach(item => {
        const sugarDate = Sugar.Date.create(item.date);
        if (Sugar.Date.isTomorrow(sugarDate)) {
          if (!itemsByDateRange["Tomorrow"]) {
            itemsByDateRange["Tomorrow"] = [];
          }
          itemsByDateRange["Tomorrow"].push(item);
          return;
        }

        if (Sugar.Date.isToday(sugarDate)) {
          if (!itemsByDateRange["Today"]) {
            itemsByDateRange["Today"] = [];
          }
          itemsByDateRange["Today"].push(item);
          return;
        }

        if (Sugar.Date.isYesterday(sugarDate)) {
          if (!itemsByDateRange["Yesterday"]) {
            itemsByDateRange["Yesterday"] = [];
          }
          itemsByDateRange["Yesterday"].push(item);
          return;
        }

        const monthYear = Sugar.Date.format(sugarDate, "{Month} {yyyy}");
        if (!itemsByDateRange[monthYear]) {
          itemsByDateRange[monthYear] = [];
        }
        itemsByDateRange[monthYear].push(item);
      });
    }

    const isFiltering = sourcesAreFiltered || typesAreFiltered;
    return (
      <>
        {/* Items list, by date range */}
        {itemsByDateRange && Object.keys(itemsByDateRange).length > 0 && (
          <ul className="items">
            {Object.keys(itemsByDateRange).map((itemsDate, index) => (
              <div key={index} className="items-for-date">
                <h3 key={index}>{itemsDate}</h3>
                {itemsByDateRange[itemsDate].map((item, index) => (
                  <ItemComponent
                    key={index}
                    item={item}
                    subItems={this.props.items
                      .filter(subItem => subItem.associatedItemId === item.id)
                      .sort(function(itemA, itemB) {
                        return tasksOrder === "DESC"
                          ? Sugar.Date.create(itemB.date) -
                              Sugar.Date.create(itemA.date)
                          : Sugar.Date.create(itemA.date) -
                              Sugar.Date.create(itemB.date);
                      })}
                    onChecked={(item, checked) =>
                      this.props.onChecked(item, checked)
                    }
                    addItem={item => this.props.addItem(item)}
                  />
                ))}
              </div>
            ))}
          </ul>
        )}

        {/* Items list */}
        {/*
          items && items.length > 0 && (
          <ul className="items">
            {items.map((item, index) => (
              <ItemComponent
                key={index}
                item={item}
                subItems={this.props.items
                  .filter(subItem => subItem.associatedItemId === item.id)
                  .sort(function(itemA, itemB) {
                    return tasksOrder === "DESC"
                      ? Sugar.Date.create(itemB.date) -
                          Sugar.Date.create(itemA.date)
                      : Sugar.Date.create(itemA.date) -
                          Sugar.Date.create(itemB.date);
                  })}
                onChecked={(item, checked) =>
                  this.props.onChecked(item, checked)
                }
                addItem={item => this.props.addItem(item)}
              />
            ))}
          </ul>
        )
        */}

        {/* "No items found" output */}
        {(!items || items.length === 0) && (
          <>
            <div>No {isFiltering ? "matching " : ""}items found</div>
          </>
        )}
      </>
    );
  }
}

class ItemComponent extends Component {
  async addItem(item) {
    // Prompts the user to enter a item
    let task = window.prompt(`${item.source} - Add item`);

    // Sanitizes the task
    task = Helper.sanitizedString(task);

    // Checks if the task is still valid
    if (!task) {
      return;
    }

    // TODO: Change the logic here to so that the item gets added locally, then added online, but then removed locally if the online adding fails

    const newItem = await createTask(
      new Item({
        source: "Task",
        type: ItemTypes.TASK,
        content: task,
        date: Sugar.Date.create("now").toISOString(),
        associatedItemId: item.id
      })
    );

    if (!newItem) {
      alert("There was a problem creating your task, please try again");
      return;
    }

    // Adds a new Item
    this.props.addItem(newItem);
  }

  render() {
    const sanitizedSource = Helper.toDashedLower(this.props.item.source);
    //const itemDateTime = this.props.item.date ? Sugar.Date.create(this.props.item.date) : null;
    //const relativeDateTime = itemDateTime ? Sugar.Date.relative(itemDateTime) : null;

    return (
      <>
        {/* Item details */}
        <li
          className={classNames("item", [`item--${sanitizedSource}`], {
            "item--unread": this.props.item.unread
          })}
        >
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
          {this.props.item.sender && (
            <div className="item__sender">{this.props.item.sender}</div>
          )}
          <div className="item__details">
            {this.props.item.title && (
              <div className="item__title">{this.props.item.title}</div>
            )}
            {this.props.item.content && (
              <div className="item__content">{this.props.item.content}</div>
            )}
            {/* <div style={{ fontSize: "x-small" }}>ID: {this.props.item.id}</div> */}
          </div>
          {/* TODO: Change this logic so that the subitems item always shows, but on the far-right side */}
          <div className="item__controls">
            <div
              className="item__show-items"
              onClick={() => {
                this.props.item.showSubItems = !this.props.item.showSubItems;
                this.forceUpdate();
              }}
            >
              {this.props.subItems.length > 0 && (
                <>
                  <img
                    src={require(`../assets/images/icons/check_light.png`)}
                    title="Tasks"
                    alt="Tasks"
                  />
                  <div className="item__items-count">
                    {this.props.subItems.length}
                  </div>
                </>
              )}
            </div>
            <div
              className="item__add-item"
              onClick={() => this.addItem(this.props.item)}
            >
              <img
                src={require(`../assets/images/icons/plus_light.png`)}
                title="Add task"
                alt="Add task"
              />
            </div>
            <div className="item__url">
              <a
                href={this.props.item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {this.props.item.url && (
                  <img
                    src={require(`../assets/images/icons/open-in-new_light.png`)}
                    title="Open link"
                    alt="Open link"
                  />
                )}
              </a>
            </div>
          </div>
        </li>

        {/* Sub items */}
        {this.props.item.showSubItems && (
          <ul className="item__sub-items">
            {this.props.subItems.map((item, index) => (
              // TODO: Find why this doesn't display sub-items for sub-items
              <ItemComponent
                key={index}
                item={item}
                subItems={this.props.subItems
                  .filter(subItem => subItem.associatedItemId === item.id)
                  .sort(function(itemA, itemB) {
                    return tasksOrder === "DESC"
                      ? Sugar.Date.create(itemB.date) -
                          Sugar.Date.create(itemA.date)
                      : Sugar.Date.create(itemA.date) -
                          Sugar.Date.create(itemB.date);
                  })}
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
