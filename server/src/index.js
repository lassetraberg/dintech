const express = require("express");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const cors = require("cors");
const { ApolloServer } = require("apollo-server-express");

const app = express();
const expressWs = require("express-ws")(app);
const sessionHandler = require("./routes/sessionHandler");
const schema = require("./graphql");
const graphqlServer = new ApolloServer(schema);

const swagger = YAML.load("docs/swagger.yaml");
const port = process.env.PORT || 3000;

graphqlServer.applyMiddleware({ app });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swagger));

app.ws("/api/session/:url", sessionHandler.wsHandler);

app.post("/api/session", sessionHandler.createSession);
app.get("/api/session/:url", sessionHandler.getSessionInfo);

app.listen(port, () => console.log(`Listening on ${port}`));

/*
Node, Express, REST, WebSocket, Swagger, hapi joi
*/
