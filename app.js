require("dotenv").config()
const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require("./config/mongodb");
const userRoutes = require("./routes/user.routes");
const indexRoutes = require("./routes/index.routes");
app.use(cors());

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/", indexRoutes);
app.use("/users", userRoutes);


app.listen(3000);