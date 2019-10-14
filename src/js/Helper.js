const uuidv1 = require("uuid/v1");
const md5 = require("md5");

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

export function encrypt(string) {
  return md5(string);
}

export function getCurrentTimestamp() {
  return Math.floor(Date.now() / 1000);
}
