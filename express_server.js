const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser());
const bodyParser = require("body-parser");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
const PORT = 8080;

//I'll need req.cookies for my sign in handler
//sample code
// app.get('/', function (req, res) {
//   // Cookies that have not been signed
//   console.log('Cookies: ', req.cookies)

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

app.get("/login", (req, res) => {
  res.render("/login");
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  console.log(username);
  const newCookie = res.cookie('name', username);
  console.log(newCookie);
  //console.log('Cookies: ', req.cookies)
  res.redirect("/urls");
})

//route handler for /urls
app.get("/urls", (req, res) => {
  const templateVars= { 
    username: req.cookies["username"],
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars)
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const url = req.body;
  const newUrlKey = generateRandomString()
  urlDatabase[newUrlKey] = url.longURL;
  res.redirect(`/urls/${newUrlKey}`); 
});



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
  const templateVars= { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.post("/urls/edit", (req, res) => {
  const url = req.body;
  //getting rid of the old Short URL
  for (const key in urlDatabase) {
    if (urlDatabase[key] === url.longURL)
    delete urlDatabase[key];
  }
  //making the new ShortURL
  const newUrlKey = generateRandomString()
  urlDatabase[newUrlKey] = url.longURL;
  res.redirect(`/urls/${newUrlKey}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]
  };
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



