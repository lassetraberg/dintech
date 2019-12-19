/* Imports */
const express = require("express");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const cors = require("cors");

/* Setup server */
const app = express();
const expressWs = require("express-ws")(app);
const swagger = YAML.load("docs/swagger.yaml");
const port = 8080;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

/* ---- Routes ---- */
/* Controllers */
const sessionHandler = require("./routes/sessionHandler");
/* Endpoints */
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swagger));
app.ws("/api/session/:url", sessionHandler.wsHandler);
app.post("/api/session", sessionHandler.createSession);
app.get("/api/session/:url", sessionHandler.getSessionInfo);

/* Start server*/
app.listen(port, () => console.log(`Listening on ${port}`));

/*
Node, Express, REST, WebSocket, Swagger, hapi joi
*/