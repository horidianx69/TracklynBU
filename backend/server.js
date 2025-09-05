const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors")
const app = express();
const PORT = process.env.PORT || 4000;
connectDB()

app.use(express.json())
app.use(cors)
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



