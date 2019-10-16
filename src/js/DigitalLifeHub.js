import React, { Component } from "react";
import * as Helper from "./Helper";
// import logo from "../assets/images/logo.svg";
import "../css/main.scss";
// import Gmail from "./gmail/Gmail";
// import Wunderlist from "./sources/Wunderlist";
import {
  Wunderlist,
  getTasks as getWunderlistItems
} from "./sources/Wunderlist";

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

  constructor(
    source,
    type,
    title,
    content,
    url,
    date,
    completed = false,
    id = null,
    associatedItemId = 0
  ) {
    this.source = source;
    this.type = type;
    this.title = title;
    this.content = content;
    this.url = url;
    this.date = date;
    this.completed = completed;
    // TODO: Make this a proper ID
    this.id =
      id || Helper.encrypt(`${this.source}-${this.content}-${this.timestamp}`);
    this.associatedItemId = associatedItemId;
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
      items: null
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

    // TODO: Get Gmail "Items"
    items.push(
      new Item(
        "Gmail",
        ItemTypes.EMAIL,
        "Email from person 1",
        "Hi this is person 1",
        "https://www.gmail.com/email",
        "2019-01-14T22:42:28+0000"
      ),
      new Item(
        "Gmail",
        ItemTypes.EMAIL,
        "Spam from crappy business",
        "Yeah it's true, we suck",
        "https://www.gmail.com/email",
        "2019-04-14T22:43:34+0000"
      )
    );

    // Gets all Wunderlist items
    const wunderlistItems = await getWunderlistItems();
    items = items.concat(wunderlistItems);

    // TODO: Get tasks
    items.push(
      new Item(
        "User",
        ItemTypes.TASK,
        "",
        "Do the thing (Mar)",
        "",
        "2019-03-14T22:43:25+0000"
      ),
      new Item(
        "User",
        ItemTypes.TASK,
        "",
        "Do the other thing (Jun)",
        "",
        "2019-07-14T22:43:59+0000"
      ),
      new Item(
        "User",
        ItemTypes.TASK,
        "",
        "Do the Gmail thing (Sep)",
        "",
        "2019-02-14T22:43:06+0000",
        false,
        0,
        "d1d7bf74fea7330d3acf8677e9303c09"
      ),
      new Item(
        "User",
        ItemTypes.TASK,
        "",
        "Do the Gmail thing (Aug)",
        "",
        "2019-08-14T19:45:32+0000",
        false,
        0,
        "d1d7bf74fea7330d3acf8677e9303c09"
      ),
      new Item(
        "User",
        ItemTypes.TASK,
        "",
        "Do the Wunderlist thing (Jul)",
        "",
        "2019-06-14T22:43:45+0000",
        false,
        0,
        "4d6d1da1"
      )
    );

    // TODO: Also add Filters for "Types" (eg "Item", "Item", etc)
    // Builds a list of Filters
    const filters = [];
    const filterNames = [...new Set(items.map(item => item.source))];
    filterNames.forEach(filterName => {
      filters.push(new Filter(filterName));
    });

    this.setState({ items, filters });
  }

  componentDidMount() {
    this.displayItems();
  }

  render() {
    console.table("items", this.state.items);

    return (
      <div className="hub">
        <h1>Items</h1>
        <FiltersComponent
          filters={this.state.filters}
          onChange={() => this.forceUpdate()}
        />
        <ItemsComponent
          items={this.state.items}
          filters={this.state.filters}
          onCompleted={item => {
            /* TODO: Add logic for a item being checked off
                This logic should be to call from the source's "onTaskCompleted", as each source will need to handle this differently
                eg deleting an email in Gmail, setting a task as checked in Wunderlist
            */

            alert(`"${item.content}" completed`);
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
            onChange={item => {
              this.props.filter.checked = item.target.checked;
              this.props.onChange();
            }}
          />
          {this.props.filter.name}
        </label>
      </li>
    );
  }
}

class ItemsComponent extends Component {
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

    let items = this.props.items;
    if (items) {
      // Adds all Items
      //const itemlessItems = this.props.items.filter(item => item.itemId === 0);
      //items = items.concat(itemlessItems);

      // TODO: Currently this erroneously(?) excludes Items if a source is checked

      // Filters the Items based on the selected filters
      // Also filters out tasks that have an associated item
      items = items.filter(
        item =>
          (sourcesToDisplay.length === 0 ||
            sourcesToDisplay.includes(item.source)) &&
          item.associatedItemId === 0
      );

      // Sorts the Items
      items = items.sort(function(itemA, itemB) {
        const order = "DESC";
        return order === "DESC"
          ? Sugar.Date.create(itemB.date) - Sugar.Date.create(itemA.date)
          : Sugar.Date.create(itemA.date) - Sugar.Date.create(itemB.date);
      });
    }

    return (
      <>
        {items && (
          <ul className="items-and-items">
            {items.map((item, index) => (
              <>
                <ItemComponent
                  key={index}
                  item={item}
                  subItems={this.props.items.filter(
                    subItem => subItem.associatedItemId === item.id
                  )}
                  onCompleted={item => this.props.onCompleted(item)}
                  addItem={item => this.props.addItem(item)}
                />
              </>
            ))}
          </ul>
        )}
        {!items && <span>No items found</span>}
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
        "User",
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

    // TODO: Return different component depending on the Item's "type"

    // TODO: Email / TODO
    return (
      <>
        <li className={`item item--${sanitizedSource}`}>
          <input
            type="checkbox"
            className="item__checkbox"
            onChange={() => {
              this.props.onCompleted(this.props.item);
            }}
          />
          <img
            src={require(`../assets/images/logos/${sanitizedSource}.png`)}
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
          {this.props.subItems.length > 0 && (
            <span
              className="item__show-items"
              onClick={() => {
                this.props.item.showSubItems = !this.props.item.showSubItems;
                this.forceUpdate();
              }}
            >
              {this.props.subItems.length} task
              {this.props.subItems.length !== 1 ? "s" : ""}{" "}
              {this.props.item.showSubItems ? "^" : "v"}
            </span>
          )}
          <span
            className="item__add-item"
            onClick={() => this.addItem(this.props.item)}
          >
            +
          </span>
          {this.props.item.url && (
            <a
              href={this.props.item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="item__url"
            >
              >
            </a>
          )}
        </li>

        {this.props.item.showSubItems && (
          <ul className="item__sub-items">
            {this.props.subItems.map((item, index) => (
              <ItemComponent
                key={index}
                item={item}
                // TODO: This currently doesn't show sub-items of sub-items
                subItems={this.props.subItems.filter(
                  subItem => subItem.associatedItemId === item.id
                )}
                onCompleted={item => this.props.onCompleted(item)}
                addItem={item => this.props.addItem(item)}
              />
            ))}
          </ul>
        )}
      </>
    );

    // TODO: Task
    // return (
    //   <li
    //     className={`item${sanitizedSource ? " item--${sanitizedSource}" : ""}`}
    //   >
    //     <input
    //       type="checkbox"
    //       className="item__checkbox"
    //       onChange={() => {
    //         this.props.onCompleted(this.props.item);
    //       }}
    //     />
    //     {/* TODO: Put an element here to keep conformity in spacing with Items */}
    //     <div className="item__details">
    //       {this.props.item.title && (
    //         <span className="item__title">{this.props.item.title}</span>
    //       )}
    //       {this.props.item.content && (
    //         <span className="item__content">{this.props.item.content}</span>
    //       )}
    //     </div>
    //     {relativeDateTime && (
    //       <span className="item__date">{`${relativeDateTime} [${Sugar.Date.format(
    //         itemDateTime,
    //         "{dd}/{MM}"
    //       )}]`}</span>
    //     )}
    //   </li>
    // );
  }
}

// class ItemComponent extends Component {
//   render() {
//     const sanitizedSource = Helper.toDashedLower(this.props.item.source);
//     const itemDateTime = this.props.item.date
//       ? Sugar.Date.create(this.props.item.date)
//       : null;
//     const relativeDateTime = itemDateTime
//       ? Sugar.Date.relative(itemDateTime)
//       : null;

//     return (
//       <li
//         className={`item${sanitizedSource ? " item--${sanitizedSource}" : ""}`}
//       >
//         <input
//           type="checkbox"
//           className="item__checkbox"
//           onChange={() => {
//             this.props.onCompleted(this.props.item);
//           }}
//         />
//         {/* TODO: Put an element here to keep conformity in spacing with Items */}
//         <div className="item__details">
//           {this.props.item.title && (
//             <span className="item__title">{this.props.item.title}</span>
//           )}
//           {this.props.item.content && (
//             <span className="item__content">{this.props.item.content}</span>
//           )}
//         </div>
//         {relativeDateTime && (
//           <span className="item__date">{`${relativeDateTime} [${Sugar.Date.format(
//             itemDateTime,
//             "{dd}/{MM}"
//           )}]`}</span>
//         )}
//       </li>
//     );
//   }
// }

export default DigitalLifeHub;
