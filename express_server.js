const express = require("express");
const PORT = 8080;
const bodyParser = require("body-parser");
//body parser makes the forms
const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));


//HELPER FUNCTIONS

//for making unique ids
const generateRandomString = () => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTYUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'
  for (let i = 0; i < 6; i++) {
    let randomNumber = Math.floor(Math.random() * 62);
    result += characters[randomNumber];
  }
  return result;
};

//for checking for duplicates in the users database
const checkUniqueId = compareItem => {
  let itemUnique = true;
  for (const user in users) {
    if (users[user].id === compareItem) {
      itemUnique = false;
    } else if (users[user].email === compareItem) {
      itemUnique = false;
    } 
  }
  return itemUnique;
};

//DATABASES

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "Frc345": "http://www.example.com"
};

//ROUTES

//Register new user path
app.get("/register", (req, res) => {
  const templateVars= { 
    //updated
    userId: req.cookies["user_id"],
  };
  res.render("register", templateVars);
});

//Register submit handler
//DONE add logic preventing double registration from same email 
//TO DO add logic preventing double ups of the same user id
//DONE add logic that forces the user to input a string for both email and username
app.post("/register", (req, res) => {

  //tentaitive logic for preventing userId double ups. Will wait for this to come up in assignment
  // let newUserId = generateRandomString();
  // while(checkUniqueId(newUserId) === false) {
  //   newUserId = generateRandomString();
  // }

  const id = generateRandomString();
  const email = req.body.userEmail;
  const password = req.body.userPassword;
  if (!email || !password) {
    //sending status code assistance from https://stackoverflow.com/questions/14154337/how-to-send-a-custom-http-status-message-in-node-express
    res.status(400).send("Please enter a valid email and password");
  } else if (checkUniqueId(email) === false) {
    res.status(400).send("This email is already in use")
  } else {
    users[id] = {
      "id": id,
      "email": email,
      "password": password
    };
    res.cookie('user_id', users[id]);
    console.log(users);
    res.redirect("/urls");
  }
});

//User home page 


//Login path

app.get("/login", (req, res) => {
  res.render("/login");
});

//Login submit handler
app.post("/login", (req, res) => {
  //TO DO: add an "if else " username matches && password match statement to reach the user home page route
  //if truthy res.cookie("user", )
  //NO MORE USERNAME res.cookie('username', req.body.username);
  res.redirect("/urls");
  //else redirect to non-user homepage
})

//Logout path

app.get("/logout", (req, res) => {
  res.render("/login");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
})


// /url_index page

app.get("/urls", (req, res) => {
  const templateVars= { 
    //updated
    userId: req.cookies["user_id"],
    urls: urlDatabase 
  };
  //console.log(username);
  res.render("urls_index", templateVars)
});

//New TinyURL route

//edge cases to consider
// What would happen if a client requests a non-existent shortURL?
// What happens to the urlDatabase when the server is restarted?
// What type of status code do our redirects have? What does this status code mean?

app.get("/urls/new", (req, res) => {
  const templateVars= { 
    //updated
    userId: req.cookies["user_id"] 
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const url = req.body;
  const newUrlKey = generateRandomString()
  urlDatabase[newUrlKey] = url.longURL;
  res.redirect(`/urls/${newUrlKey}`); 
});

//Delete TinyURL route

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log("deleting" + req.params.shortURL);
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//Edit existing TinyURL path

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
    //updated
    userId: req.cookies["user_id"],
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

//shortURL redirect route
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

// 404 Page
// app.get("*", (req, res)=> {
//   //make 404 ejs
// res.render("404");
// })

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



