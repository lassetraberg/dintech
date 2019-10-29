const commandSchemas = require("../schemas/commandSchemas");
const Joi = require("@hapi/joi");
const { wsSendError, makeError, generateUrl } = require("../util/helper");
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

    if (!schema) {
      wsSendError(ws, `Invalid command: ${dataString}`);
      return;
    }

    const { error, value } = schema.validate(parsedJson);
    if (error) {
      wsSendError(ws, `Invalid command: ${error.toString()}`);
      console.error(error);
      return;
    }

    session.clients.forEach(client => client.ws.send(dataString));
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
    res.status(201).json({ url });
  } else {
    res.status(400).json(makeError("Session already exists."));
  }
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
  } else {
    res.status(404).json(makeError("Session not found."));
  }
};

const sessionHandler = {
  createSession,
  getSessionInfo,
  wsHandler
};

module.exports = sessionHandler;
