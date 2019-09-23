const uuidv1 = require("uuid/v1");

export function toDashedLower(string) {
  return (
    string &&
    string
      .split(" ")
      .join("-")
      .toLowerCase()
  );
}

export function generateUniqueId() {
  return uuidv1();
}
