const express = require("express");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const app = express();
const expressWs = require("express-ws")(app);
const sessionHandler = require("./routes/sessionHandler");

const swaggerRest = YAML.load("docs/swagger.yaml");
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerRest));

app.ws("/api/session/:url", sessionHandler.wsHandler);

app.post("/api/session", sessionHandler.createSession);
app.get("/api/session/:url", sessionHandler.getSessionInfo);

app.listen(port, () => console.log(`Listening on ${port}`));

/*
Node, Express, REST, WebSocket, Swagger
*/
