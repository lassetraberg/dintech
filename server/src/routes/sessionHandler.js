const Joi = require("@hapi/joi");

const redis = require("../util/redis");
const commandSchemas = require("../schemas/commandSchemas");
const restSchemas = require("../schemas/restSchemas");
const {
  wsSendError,
  wsSendObj,
  makeError,
  generateUrl,
  getSessionInfoHelper,
  createNewSession
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

// const sessions = {};

const wsHandler = async (ws, req) => {
  const url = req.params.url;
  const session = await redis.get(url);
  // const session = sessions[url]; 
  const username = req.query.username;

  const wsRequest = { url, session, username, ws };

  wsOnConnection(wsRequest);
  ws.on("message", dataString => wsOnMessage({ ...wsRequest, dataString }));
  ws.on("close", () => wsOnClose(wsRequest));
};

const wsOnConnection = async (wsRequest) => {
  const { url, session, ws, username } = wsRequest;
  if (!session) {
    wsSendError(ws, "Session does not exist.", "NO_SESSION");
    ws.close();
    return;
  }
  if (!username) {
    wsSendError(ws, "You must specify a username.", "NO_USERNAME");
    ws.close();
    return;
  }
  if (
    session.clients
      .map(c => c.username.toUpperCase())
      .includes(username.toUpperCase())
  ) {
    wsSendError(ws, "Name already in use.", "USERNAME_IN_USE");
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
  await redis.set(url, session);
  // sessions[url] = session;
  wsSendObj(ws, getSessionInfoHelper(url));

  if (session.admin.ws !== ws) {
    wsSendObj(session.admin.ws, { command: "requestState" });
  }
};

const wsOnMessage = async (wsRequest) => {
  const { session, dataString, ws, username } = wsRequest;

  if (session.admin.ws === ws) {
    const parsedJson = JSON.parse(dataString);

    const schema = commandSchemas[parsedJson.command];

    if (!schema || !Joi.isSchema(schema)) {
      wsSendError(ws, `Invalid command: ${dataString}`, "INVALID_COMMAND");
      return;
    }

    const { error, value } = schema.validate(parsedJson);
    if (error) {
      wsSendError(
        ws,
        `Invalid command: ${error.toString()}`,
        "INVALID_COMMAND"
      );
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

const wsOnClose = async (wsRequest) => {
  const { url, session, ws } = wsRequest;

  if (session) {
    session.clients = session.clients.filter((val, i, arr) => val.ws !== ws);
    console.log("Client disconnected");

    if (session.clients.length === 0) {
      const deleted = await redis.del(url);

      if (deleted) {
        console.log("Session deleted");
      } else {
        console.log("Session not deleted");
      }

      // delete sessions[url];
      // console.log("Session deleted");
    }
  }
};

const createSession = async (req, res) => {
  const { error, value } = restSchemas.createSession.validate(req.body);
  if (error) {
    res.status(400).json(makeError(error.toString()));
    return;
  }

  const { ytUrl, username } = value;
  const data = createNewSession(ytUrl, username);

  if (data) {
    res.status(400).json(makeError("Session already exists."));
  } else {
    res.status(201).json({ url: data.url });
  }
};

const getSessionInfo = async (req, res) => {
  const url = req.params.url;

  const sessionInfo = await getSessionInfoHelper(url);
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
