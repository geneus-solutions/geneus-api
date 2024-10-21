import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { readdirSync } from "fs";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";

const app = express();
const path = require("path");

// Serve static files from the React build folder
//app.use(express.static(path.join(__dirname, "client/build")));

// Set middleware of CORS 
app.use((req, res, next) => {
    res.setHeader(
      "Access-Control-Allow-Origin",
      process.env.FRONTEND_URL
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
    );
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Private-Network", true);
    //  Firefox caps this at 24 hours (86400 seconds). Chromium (starting in v76) caps at 2 hours (7200 seconds). The default value is 5 seconds.
    res.setHeader("Access-Control-Max-Age", 7200);
  
    next();
  });

//app.options('*',cors())
app.use(cookieParser());
//app.use(cors());
/*app.use(
    cors({
        credentials: true,
        origin: [process.env.FRONTEND_URL],
    })
);*/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));
// Serve static files from the React build folder
//app.use(express.static(path.join(__dirname, "client/build")));

//app.use(express.static(__dirname));

const routes = readdirSync("./routes");
routes.forEach(async (r) => {
    const routePath = `./routes/${r}`;
    const router = (await import(routePath)).default;
    app.use("/", router);
});

// Set up Morgan with a custom log format and write logs to a file
const fs = require("fs");
//const path = require("path");
const accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), { flags: "a" });

app.use(morgan("combined", { stream: accessLogStream }));
// Define a catch-all route that serves the React app
//app.get("*", (req, res) => {
  //res.sendFile(path.join("/client/build/index.html"));
//});

//app.get('*', (req, res) => {
 // res.send('public/index.html')
 // res.sendFile(path.join("/client/build/index.html"));
//});
// Start the server
const PORT = process.env.PORT || 8000;

app.listen(PORT, () =>
    console.log(`Server is running successfully on PORT ${PORT}`)
);


mongoose
    .connect(process.env.DATABASE)
    .then(() => console.log("DB Connected Successfully"))
    .catch((err) => console.log("DB Connection err =>", err));