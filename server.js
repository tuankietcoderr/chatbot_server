const { config, run } = require("./utils/config");
const connectDB = require("./utils/db");
const getRoutes = require("./routes");
const express = require("express");

const app = config(express);

getRoutes(app);
connectDB();
run(app);
