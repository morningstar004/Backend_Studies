const express = require("express");
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("hello World");
});

// Start the server
app.get("/about", (req, res)=> {
    res.send("That's the about page");
})

// resion of using nodmon is : To automatically restart the server when ever the code is changed and saved.
app.get("/contact", (req, res)=> {
    res.send("<h2>That's the contact page</h2>");
})

app.listen(PORT, () => {
  console.log(`Connected to port ${PORT}`);
});
