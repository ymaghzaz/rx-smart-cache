const hash = require("crypto").createHash;

const generateID = obj =>
  hash("sha1")
    .update(JSON.stringify(obj))
    .digest("base64");

module.exports = generateID;
