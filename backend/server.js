import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import useReducer from "./routes/userRoute.js";
import taskRouter from "./routes/TaskRoute.js";

const app = express();
const port = process.env.PORT || 4000;

//Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//DB connect
connectDB();

//Route
app.use("/api/user",useReducer)
app.use("/api/task",taskRouter)

app.get("/", (req, res) => {
  res.send("API WORKING");
});

app.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`);
});
