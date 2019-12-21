const Joi = require("@hapi/joi");
const redis = require("../util/redis");
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

const sockets = {};


const wsHandler = (ws, req) => {
  const url = req.params.url;
  const username = req.query.username;
  console.log(username);

  redis.client.get(url, (err, session) => {
    session = JSON.parse(session);
    const wsRequest = { url, session, username, ws };
    wsOnConnection(wsRequest);
    ws.on("message", dataString => wsOnMessage({ ...wsRequest, dataString }));
    ws.on("close", () => wsOnClose(wsRequest));
  })
};

const wsOnConnection = wsRequest => {
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

  if (!sockets[url]) sockets[url] = [];
  session.clients.push({ username });
  const client = {username, ws};
  sockets[url].push(client);
  let joinMessage = "Client connected";
  if (session.admin.username.toUpperCase() === username.toUpperCase()) {
    session.admin.username = username;
    joinMessage += " (admin)";
  }
  console.log(joinMessage);
  redis.client.set(url, JSON.stringify(session));
  redis.client.get(url, (err, session) => {
    session = JSON.parse(session);
    if (!session) return null;
    const sessionInfoHelper = {
      usernames: session.clients.map(client => client.username),
      totalClients: session.clients.length,
      admin: session.admin.username,
      ytUrl: session.url
    };
    wsSendObj(ws, sessionInfoHelper);
  })

  if (session.admin.username !== username) {
    const adminWs = sockets[url].filter(w => w.username === session.admin.username).ws;
    if (adminWs) wsSendObj(adminWs, { command: "requestState" });
  }
};


redis.subscriber.subscribe("message");
redis.subscriber.on("message", (channel, message) => {
  const { url, dataString, ws, username } = JSON.parse(message);
  if (sockets[url]) {
    redis.client.get(url, (err, session) => {
      session = JSON.parse(session);
      const myClients = sockets[url].filter(client => session.clients.map(c => c.username).includes(client.username));
      const parsedJson = JSON.parse(dataString);
      if (commandSchemas.ignoredByAdmin.includes(parsedJson.command)) {
        myClients
          .filter(client => client.username !== session.admin.username)
          .forEach(client => {
            client.ws.send(dataString);
            console.log(`Sent "${dataString} to client ${client.username}`);
          });
      } else {
        myClients.forEach(client => {
          client.ws.send(dataString)
          console.log(`Sent "${dataString} to client ${client.username}`);
        });
      }
    });
  }
});


const wsOnMessage = wsRequest => {
  const { url, session, dataString, ws, username } = wsRequest;
  // If the client communicating is admin react to the command
  if (session.admin.username == username) {

    // Data validation
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

    // The COMMAND passed validation. Broadcast it!
    redis.publisher.publish("message", JSON.stringify(wsRequest));
  }
};

const wsOnClose = wsRequest => {
  const { url, session, username, ws } = wsRequest;
  if (session) {
    const userToDelete = sockets[url].indexOf(client => client.ws == ws);
    sockets[url].splice(userToDelete,1);

    session.clients = session.clients.filter((val, i, arr) => val.username !== username);
    redis.client.set(url, JSON.stringify(session));

    console.log("Client disconnected");
    if (session.clients.length === 0) {
      if (redis.client.del(url)) console.log("Session deleted");
      delete sockets[url]; 
    }
  }
};

/**
 * Method to create a new session.
 */
const createSession = (req, res) => {
  // Validate request body
  const { error, value } = restSchemas.createSession.validate(req.body);
  if (error) {
    res.status(400).json(makeError(error.toString()));
    return;
  }

  // Retrieve ytUrl and username
  const { ytUrl, username } = value;
  // Generate hashed url
  const url = generateUrl(ytUrl, username);

  // If the hashed url already exists, return
  redis.client.get(url, (err, session) => {
    if (session) {
      res.status(400).json(makeError("Session already exists."));
      return;
    }
    // Else define new session
    const newSession = {
      url: ytUrl,
      admin: { username },
      clients: []
    }
    // Add new session to shared memory with url as key
    redis.client.set(url, JSON.stringify(newSession));
    // Return 201: The request as been fulfilled and a new url is created.
    res.status(201).json({ url });
  });
};

const getSessionInfo = (req, res) => {
  const url = req.params.url;  
  redis.client.get(url, (err, session) => {
    session = JSON.parse(session);
    if (!session) return null;
    const sessionInfo = {
      usernames: session.clients.map(client => client.username),
      totalClients: session.clients.length,
      admin: session.admin.username,
      ytUrl: session.url
    };

    if (!sessionInfo) {
      res.status(404).json(makeError("Session not found."));
      return;
    }
  
    res.json(sessionInfo);
  })
};

const sessionHandler = {
  createSession,
  getSessionInfo,
  wsHandler
};

module.exports = sessionHandler;