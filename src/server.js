const fetch = require("node-fetch");
/* const { encode } = require("html-entities"); */
const cookieParser = require("cookie-parser");

// use the express library
const express = require("express");

const { shuffleArray } = require('../utils/shuffle');

// create a new server application
const app = express();

// add public as a static folder in express
app.use(express.static("public"));

// add ejs as a template engine
app.set("view engine", "ejs");

// use the cookie parser
app.use(cookieParser());

// Define the port we will listen on
// (it will attempt to read an environment global
// first, that is for when this is used on the real
// world wide web).
const port = process.env.PORT || 3000;

let nextVisitorId = 0;

// The main page of our website
app.get("/", (req, res) => {
  const name = req.query?.name || "World";
  const date = new Date().toLocaleString();
  const cookies = req.cookies;
  const visitorId = cookies.visitorId || ++nextVisitorId;

  res.cookie("visitorId", visitorId);
  res.cookie("visited", Date.now().toString());
  res.render("welcome", {
    name,
    date,
    visitorId,
    interval: cookies.visited
      ? Math.round((new Date() - new Date(parseInt(cookies.visited))) / 1000)
      : "0",
    visited: cookies.visited
  });

  /* res.send(` <!DOCTYPE html> */
  /*   <html lang="en"> */
  /*     <head> */
  /*       <meta charset="UTF-8" /> */
  /*       <title>An Example Title</title> */
  /*       <link rel="stylesheet" href="app.css"></link> */
  /*     </head> */
  /*     <body> */
  /*       <h1>Hello, ${encode(name)}!</h1> */
  /*       <p>HTML is so much better than a plain string!</p> */
  /*     </body> */
  /*   </html>`); */
});

app.get("/trivia", async (req , res) => {
  try{
    const response = await fetch("https://opentdb.com/api.php?amount=1&type=multiple");
    if(!response.ok){
      return res.status(500).send(`Open Trivia Database failed with HTTP code ${response.status}`);
    }
    const {response_code,results} = await response.json();

    if(response_code !== 0){
      return res.status(500).send(`Open Trivia Database failed with internal response code ${response_code}`)
    }

    res.render("trivia", {
      ...results[0],
      answers: shuffleArray([...results[0].incorrect_answers, results[0].correct_answer ].map(answer => (
    `<a href="javascript:alert('${answer === results[0].correct_answer ? 'Correct!' : 'Incorrect, Please Try Again!'
    }')">${answer}</a>`)
    ))

    });

  }catch(err){
    console.log({
      err
    })
    res.json({
      error: err
    })
  }
})

// Start listening for network connections
app.listen(port);

// Printout for readability
console.log("Server Started!");
