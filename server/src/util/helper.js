const crypto = require("crypto");

const helper = {
  allowedStates: ["isPlaying", "offset"],
  wsSendError: (ws, errorMsg) =>
    ws.send(JSON.stringify(helper.makeError(errorMsg))),
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
