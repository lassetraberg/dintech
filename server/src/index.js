const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const expressWs = require("express-ws")(app);
const sessionHandler = require("./routes/sessionHandler");

const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.ws("/session/:url", sessionHandler.wsHandler);

app.post("/session", sessionHandler.createSession);
app.get("/session/:url", sessionHandler.getSessionInfo);

app.listen(port, () => console.log(`Listening on ${port}`));

/*
Node, Express, REST, WebSocket
*/
