import express from "express";
import connectDB from "./config/connectDB";
import bodyParser from "body-parser";
import http from "http";
import webRoutes from "./route/web";
import cors from 'cors'
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8888;

// Connect to DB
connectDB();

// Use middleware to process JSON data and x-www-form-urlencoded requests
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Initialize routes
webRoutes(app);

// Create a server and listen on the specified port
const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Backend Nodejs is running on port: ${port}`);
});
