import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { readdirSync } from "fs";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url'; 
import { dirname } from 'path'; 
import User from "./routes/User.js"
import './db/Connect.js'


// Manually create __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Set middleware of CORS 
app.use((req, res, next) => {
    // res.setHeader(
    //   "Access-Control-Allow-Origin",
    //   process.env.FRONTEND_URL
    // );
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
    res.setHeader("Access-Control-Max-Age", 7200);
  
    next();
});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));


const routes = readdirSync("./routes");
routes.forEach(async (r) => {
    const routePath = `./routes/${r}`;
    const router = (await import(routePath)).default;
    app.use("/", router);
});

// Set up Morgan with a custom log format and write logs to a file
const accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), { flags: "a" });
app.use(morgan("combined", { stream: accessLogStream }));

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () =>
    console.log(`Server is running successfully on PORT ${PORT}`)
);
