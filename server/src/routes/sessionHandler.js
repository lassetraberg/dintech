const crypto = require("crypto");
const commandSchemas = require("../schemas/commandSchemas");
const Joi = require("@hapi/joi");
const { wsSendError } = require("../util/helper");

/*
    Message types:
    - Command
      - play
      - pause
        - params: offset
      - seekTo
        - params: offset
      - requestState
    - State
      - Progress in seconds
      - Paused/playing
    - Error
      - Message
    */

const sessions = {};
const allowedTypes = {
  command: {
    play: {},
    pause: { offsetFromStart: -1 },
    seekTo: { offsetFromStart: -1 }
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
  if (!session) {
    wsSendError(ws, "Session does not exists");
    ws.close();
    return;
  }
  if (session.clients.map(c => c.username).includes(username)) {
    wsSendError(ws, "Name already in use");
    return;
  }

  session.clients.push({ username, ws });
  let joinMessage = "client connected";
  if (session.admin.username.toUpperCase() === username.toUpperCase()) {
    session.admin.ws = ws;
    joinMessage += " (admin)";
  }
  console.log(joinMessage);
  sessions[url] = session;
  ws.send(
    JSON.stringify({
      ytUrl: session.url,
      usernames: session.clients.map(client => client.username)
    })
  );

  if (session.admin.ws !== ws) {
    session.admin.ws.send(
      JSON.stringify({
        command: "requestState"
      })
    );
  }
};

const wsOnMessage = wsRequest => {
  const { session, dataString, ws, username } = wsRequest;

  if (session.admin.ws === ws) {
    const parsedJson = JSON.parse(dataString);

    const schema = commandSchemas[parsedJson.command];
    if (schema) {
      const { error, value } = schema.validate(parsedJson);
      if (error) {
        wsSendError(ws, "Invalid command");
        console.error(error);
      } else {
        session.clients.forEach(client => client.ws.send(dataString));
      }
    } else {
      wsSendError(ws, "Invalid command");
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
