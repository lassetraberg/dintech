const Joi = require("@hapi/joi");

const commandSchemas = require("../schemas/commandSchemas");
const restSchemas = require("../schemas/restSchemas");
const {
  wsSendError,
  wsSendObj,
  makeError,
  generateUrl
} = require("../util/helper");
/*
    Message types:
    - Command
      - play
      - pause
        - offset: number
      - seekTo
        - offset: number
      - requestState
      - setState
        - state:
          - offset
          - isPlaying
    - State
      - state:
        - offset
        - isPlaying
    - Error
      - Message
    */

const sessions = {};

const getSessionInfoHelper = url => {
  const session = sessions[url];
  if (!session) return null;
  return {
    usernames: session.clients.map(client => client.username),
    totalClients: session.clients.length,
    admin: session.admin.username,
    ytUrl: session.url
  };
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
    wsSendError(ws, "Session does not exists.");
    ws.close();
    return;
  }
  if (!username) {
    wsSendError(ws, "You must specify a username.");
    ws.close();
    return;
  }
  if (
    session.clients
      .map(c => c.username.toUpperCase())
      .includes(username.toUpperCase())
  ) {
    wsSendError(ws, "Name already in use.");
    ws.close();
    return;
  }

  session.clients.push({ username, ws });
  let joinMessage = "Client connected";
  if (session.admin.username.toUpperCase() === username.toUpperCase()) {
    session.admin.ws = ws;
    joinMessage += " (admin)";
  }
  console.log(joinMessage);
  sessions[url] = session;
  wsSendObj(ws, getSessionInfoHelper(url));

  if (session.admin.ws !== ws) {
    wsSendObj(session.admin.ws, { command: "requestState" });
  }
};

const wsOnMessage = wsRequest => {
  const { session, dataString, ws, username } = wsRequest;

  if (session.admin.ws === ws) {
    const parsedJson = JSON.parse(dataString);

    const schema = commandSchemas[parsedJson.command];

    if (!schema || !Joi.isSchema(schema)) {
      wsSendError(ws, `Invalid command: ${dataString}`);
      return;
    }

    const { error, value } = schema.validate(parsedJson);
    if (error) {
      wsSendError(ws, `Invalid command: ${error.toString()}`);
      console.error(error);
      return;
    }

    if (commandSchemas.ignoredByAdmin.includes(parsedJson.command)) {
      session.clients
        .filter(client => client.ws !== session.admin.ws)
        .forEach(client => client.ws.send(dataString));
    } else {
      session.clients.forEach(client => client.ws.send(dataString));
    }
  }
};

const wsOnClose = wsRequest => {
  const { url, session, ws } = wsRequest;

  if (session) {
    session.clients = session.clients.filter((val, i, arr) => val.ws !== ws);
    console.log("Client disconnected");
    if (session.clients.length === 0) {
      delete sessions[url];
      console.log("Session deleted");
    }
  }
};

const createSession = (req, res) => {
  const { error, value } = restSchemas.createSession.validate(req.body);
  if (error) {
    res.status(400).json(makeError(error.toString()));
    return;
  }

  const { ytUrl, username } = value;
  const url = generateUrl(ytUrl, username);

  if (sessions[url]) {
    res.status(400).json(makeError("Session already exists."));
    return;
  }

  sessions[url] = {
    url: ytUrl,
    admin: { username, ws: undefined },
    clients: [] // [{username, ws}]
  };

  setTimeout(() => {
    if (sessions[url] && sessions[url].clients.length === 0) {
      delete sessions[url];
      console.log("Session deleted");
    }
  }, 1000 * 60); // Deletes a session, if no one joins in 1 minute

  res.status(201).json({ url });
};

const getSessionInfo = (req, res) => {
  const url = req.params.url;
  const sessionInfo = getSessionInfoHelper(url);
  if (!sessionInfo) {
    res.status(404).json(makeError("Session not found."));
    return;
  }

  res.json(sessionInfo);
};

const sessionHandler = {
  createSession,
  getSessionInfo,
  wsHandler
};

module.exports = sessionHandler;
