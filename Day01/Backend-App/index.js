//importing express and dotenv modules
const express = require("express");
const dotenv = require('dotenv');

//configuring dotenv module
dotenv.config();
//creating an instance of express
const app = express();

//getting the port number from environment variables (dotenv module is used to load environment variables from a .env file into process.env)
const PORT = process.env.PORT;

// Defining routes for the application
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

// Starting the server and listening on the specified port(Shows a message in the console when the server is successfully connected to the port)
app.listen(PORT, () => {
  console.log(`Connected to port ${PORT}`);
});
