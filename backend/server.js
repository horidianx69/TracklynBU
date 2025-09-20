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

app.get("/me", protect, (req, res) => {
  //call this endpoint with the token in the header to get current user details
  res.json({
    success: true,
    user: req.user
  })
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



