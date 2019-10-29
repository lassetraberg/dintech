const crypto = require("crypto");
const WebSocket = require("ws");

const sessions = {};
const allowedTypes = {
  command: {
    play: {},
    pause: { offsetFromStart: -1 },
    skipTo: { offsetFromStart: -1 }
  },
  state: {
    paused: false
  }
};

const generateUrl = (ytUrl, username) => {
  const sha = crypto.createHash("sha1");
  sha.update(`${ytUrl}:${username}:${Date.now()}`);
  const url = sha.digest("hex");
  return url;
};

const wsHandler = (ws, req) => {
  const url = req.params.url;
  const session = sessions[url];
  const username = req.query.username;

  const wsRequest = { url, session, username, ws };
  wsOnConnection(wsRequest);
  ws.on("message", dataString => wsOnMessage({ ...wsRequest, dataString }));
  ws.on("close", () => wsOnClose(wsRequest));
};

const wsOnConnection = wsRequest => {
  const { url, session, ws, username } = wsRequest;
  if (session) {
    session.clients.push({ username, ws });
    let callbackMessage = "client connected";
    if (session.admin.username === username) {
      session.admin.ws = ws;
      callbackMessage += " (admin)";
    }
    console.log(callbackMessage);
    sessions[url] = session;
  }
};

const wsOnMessage = wsRequest => {
  const { session, dataString, ws, username } = wsRequest;
  /*
    Message types:
    - Command
      - Play
      - Pause
      - Skip to XX seconds
    - State
      - Progress in seconds
      - Paused/playing
    */

  console.log(sessions);

  if (session.admin.ws === ws) {
    const data = JSON.parse(dataString);
    if (Object.keys(allowedTypes.command).includes(data.command)) {
      const command = allowedTypes.command[data.command];
      if (
        command === allowedTypes.command.pause ||
        command === allowedTypes.command.skipTo
      ) {
        if (typeof data.offsetFromStart !== "number") {
          console.log(
            `Error: ${command} command: offsetFromStart argument not a number`
          );
          return;
        }
      }
      session.clients.forEach(client => client.ws.send(dataString));
    } else if (Object.keys(allowedTypes.state).includes(data.state)) {
      const state = allowedTypes.state[data.state];
      if (state === allowedTypes.state.paused) {
        if (typeof data.param !== "boolean") {
          console.log(`Error: ${state} command: param argument not a boolean`);
          return;
        }
      }
      session.clients.forEach(client => client.ws.send(dataString));
    }
  }
};

const wsOnClose = wsRequest => {
  const { url, session, ws } = wsRequest;

  if (session) {
    session.clients = session.clients.filter((val, i, arr) => {
      return val.ws !== ws;
    });
    if (session.clients.length === 0) {
      delete sessions[url];
    }
  }
  console.log("Client disconnected");
};

const createSession = (req, res) => {
  const ytUrl = req.body.ytUrl;
  const username = req.body.username;
  const url = generateUrl(ytUrl, username);
  if (!sessions[url]) {
    sessions[url] = {
      url: ytUrl,
      admin: { username, ws: undefined },
      clients: [] // [{username, ws}]
    };
  } else {
    //
  }
  res.status(201).json({ url });
};

const getSessionInfo = (req, res) => {
  const url = req.params.url;
  const session = sessions[url];
  if (session) {
    const usernames = session.clients.map(client => client.username);
    const totalClients = session.clients.length;
    const admin = session.admin.username;
    const ytUrl = session.url;

    res.json({ usernames, totalClients, admin, url: ytUrl });
  }
  res.status(404);
};

const sessionHandler = {
  createSession,
  getSessionInfo,
  wsHandler
};

module.exports = sessionHandler;
