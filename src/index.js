import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import dotenv from "dotenv"
dotenv.config();
import express from "express";
import connectDB from "./db/index.js";




connectDB();


