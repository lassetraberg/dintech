const crypto = require("crypto");

const helper = {
  wsSendError: (ws, errorMsg) =>
    helper.wsSendObj(ws, helper.makeError(errorMsg)),

  wsSendObj: (ws, obj) => ws.send(JSON.stringify(obj)),

  makeError: message => {
    return {
      error: {
        message
      }
    };
  },

  generateUrl: (ytUrl, username) => {
    const sha = crypto.createHash("sha1");
    sha.update(`${ytUrl}:${username}:${Date.now()}`);
    const url = sha.digest("hex");
    return url;
  }
};

module.exports = helper;
