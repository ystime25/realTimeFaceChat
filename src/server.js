import "dotenv/config";
//import WebSocket from "ws";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import http from "http";
import express from "express";
import logger from "morgan";

const PORT = process.env.PORT;

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));
app.use(logger("dev"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

instrument(wsServer, {
  auth: false,
});

const handleListen = () => {
  console.log(`Server Online => http://localhost:${PORT} ✅`);
};
httpServer.listen(PORT, handleListen);
