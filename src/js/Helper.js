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

export function hash(string) {
  return string
    .split("")
    .map(v => v.charCodeAt(0))
    .reduce((a, v) => (a + ((a << 7) + (a << 3))) ^ v)
    .toString(16);
}
