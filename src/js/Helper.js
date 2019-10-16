const uuidv1 = require("uuid/v1");
const md5 = require("md5");

export function toDashedLower(str) {
  return (
    str &&
    str
      .split(" ")
      .join("-")
      .toLowerCase()
  );
}

export function sanitizedString(str) {
  if (!str) {
    return str;
  }

  str = str.trim();

  // TODO: Fully sanitize the string

  return str;
}

export function generateUniqueId() {
  return uuidv1();
}

export function encrypt(str) {
  return md5(str);
}

export function hash(str) {
  return str
    .split("")
    .map(v => v.charCodeAt(0))
    .reduce((a, v) => (a + ((a << 7) + (a << 3))) ^ v)
    .toString(16);
}
