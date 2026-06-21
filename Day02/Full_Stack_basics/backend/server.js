import express from "express"; // module js formate
// const express = require("express"); // common js formate
const PORT = 5000;
const app = express();

app.get("/", (req, res) => {
  res.send("server is ready!");
});

app.get("/api/jokes", (req, res) => {
  const jokes = [
    {
      id: 1,
      title: "The Bison Joke",
      joke: "What did the buffalo say to his son when he left for college? Bison.",
    },
    {
      id: 2,
      title: "The Chicken Joke",
      joke: "Why did the chicken cross the road? To get to the other side.",
    },
    {
      id: 3,
      title: "The Cow Joke",
      joke: "Why do cows have hooves instead of feet? Because they lactose.",
    },
    {
      id: 4,
      title: "The Dog Joke",
      joke: "What do you call a dog magician? A labracadabrador.",
    },
    {
      id: 5,
      title: "The Elephant Joke",
      joke: "Why do elephants never use computers? They're afraid of the mouse.",
    },
  ];
  res.json(jokes);
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
