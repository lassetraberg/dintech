const crypto = require("crypto");
const redis = require("./redis");

const helper = {
  wsSendError: (ws, errorMsg, errorCode) =>
    helper.wsSendObj(ws, helper.makeError(errorMsg, errorCode)),

  wsSendObj: (ws, obj) => ws.send(JSON.stringify(obj)),

  makeError: (message, errorCode) => {
    return {
      error: {
        message,
        errorCode
      }
    };
  },

  generateUrl: (ytUrl, username) => {
    const sha = crypto.createHash("sha1");
    sha.update(`${ytUrl}:${username}:${Date.now()}:${Math.random()}`);
    const url = sha.digest("hex");
    return url;
  },

  getSessionInfoHelper: async url => {
    const session = await redis.get(url);

    // const session = sessions[url]; 
    if (!session) return null;

    return {
      usernames: session.clients.map(client => client.username),
      totalClients: session.clients.length,
      admin: session.admin.username,
      ytUrl: session.url
    }
  },

  createNewSession: async (ytUrl, username) => {
    const url = helper.generateUrl(ytUrl, username);

    const session = await redis.get(url);

    if (session) {
      return null;
    }

    const newSession = {
      url: ytUrl,
      admin: { username, ws: undefined },
      clients: [] // [{username, ws}]
    };

    redis.set(url, newSession);

    setTimeout(async () => {
      const session = await redis.get(url);

      if (session && session.clients.length === 0) {
        const deleted = await redis.del(url);

        if (deleted) {
          console.log("Session " + url + " deleted");
        } else {
          console.log("Session " + url + " not deleted");
        }
      }
    }, 1000 * 60); // Deletes a session, if no one joins in 1 minute

    return {
      url,
      session: newSession
    };
  }
};

module.exports = helper;
