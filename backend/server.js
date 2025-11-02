// import cors from "cors";
// import express from "express";
// import morgan from "morgan";
// import routes from "./routes/index.js";
// import connectDB from "./config/db.js";
// const app = express();

// // connect to DB
// connectDB();
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL,
//     methods: ["GET", "POST", "DELETE", "PUT"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );
// app.use(morgan("dev"));
// app.use(express.json());
// const PORT = process.env.PORT || 5000;

// app.get("/", async (req, res) => {
//   res.status(200).json({
//     message: "Welcome to TaskHub API",
//   });
// });
// // http:localhost:500/api-v1/
// app.use("/api-v1", routes);

// // error middleware
// app.use((err, req, res, next) => {
//   console.log(err.stack);
//   res.status(500).json({ message: "Internal server error" });
// });

// // not found middleware
// app.use((req, res) => {
//   res.status(404).json({
//     message: "Not found",
//   });
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import morgan from "morgan";
import routes from "./routes/index.js";
import connectDB from "./config/db.js";

const app = express();

// connect to DB
connectDB();

// ✅ Correct CORS setup
app.use(
  cors({
    origin: process.env.FRONTEND_URL?.replace(/\/$/, ""), // remove trailing slash if any
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // ✅ Important if using tokens or cookies
  })
);

app.use(morgan("dev"));
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to TaskHub API",
  });
});

app.use("/api-v1", routes);

// Error middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// Not found middleware
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
