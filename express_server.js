const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
const PORT = 8080;

//NOTE right now if I try to use my short url directly from the page, I get a "too many redirects" notice
//since we weren't asked to test that capability just yet, I won't worry about it for now

function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTYUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'
  for (let i = 0; i < 6; i++) {
    let randomNumber = Math.floor(Math.random() * 62);
    result += characters[randomNumber]
  }
  return result;
  };

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "Frc345": "http://www.example.com"
};

//route handler for /urls
app.get("/urls", (req, res) => {
  const templateVars= { urls: urlDatabase };
  res.render("urls_index", templateVars)
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const url = req.body;
  const newUrlKey = generateRandomString()
  urlDatabase[newUrlKey] = url.longURL;
  res.redirect(`/urls/${newUrlKey}`); 
});

// app.get("/urls/:shortURL/delete", (req, res) => {
//   delete urlDatabase[req.params.shortURL];
//   res.redirect("/urls");
// });

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log("deleting" + req.params.shortURL);
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//edge cases to consider
// What would happen if a client requests a non-existent shortURL?
// What happens to the urlDatabase when the server is restarted?
// What type of status code do our redirects have? What does this status code mean?

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});
//moved this below app.get("urls/:shortURL")
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<htm><body>Hello <b>World</b></body></html>\n")
});

// app.get("*", (req, res)=> {
//   //make 404 ejs
// res.render("404");
// })

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



