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
const checkId = compareItem => {
  let duplicate = false
  for (const user in users) {
    if (users[user].id === compareItem) {
      duplicate = users[user].id;
    } else if (users[user].email === compareItem) {
      duplicate = users[user].id;
    } else if (users[user].password === compareItem) {
      duplicate = users[user].id; 
    }
  }
  return duplicate;
};

//for checking if a database entry belongs to the user
const filterUserURLS = (userId, database) => {
  const usersURLs = {};
  for (const item in database) {
    if (database[item].userID === userId) {
    usersURLs[item] = database[item].longURL;
    }
  }
  return usersURLs;
}

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
  },
  "aJ48lW": {
    id: "aJ48lW",
    email: "egg@egg.com",
    password: "eggy"
  }
}

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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
//DONE add logic that forces the user to input a string for both email and password
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
  } else if (checkId(email)) {
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
  const templateVars= { 
    userId: req.cookies["user_id"],
  };
  res.render("login", templateVars);
});

//Login submit handler
app.post("/login", (req, res) => {
  //DONE TO DO: add an "if else " email matches && password match statement to reach the user home page route
  const email = req.body.userEmail;
  const password = req.body.userPassword;
  let id = undefined;
  if (checkId(email)) {
    if (checkId(email) === checkId(password)) {
      let userMatch = checkId(email);
      id = users[userMatch].id;
      res.cookie('user_id', users[id]);
      res.redirect("/urls");
    } else {
      res.status(403).send("Password not correct")
    }
  } else {
  res.status(403).send("Email not found. Please register a new account");
  }
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
    userId: req.cookies["user_id"],
    urls: urlDatabase, 
  };
  const userId = req.cookies["user_id"];
  if (userId === undefined) {
    res.redirect("/login")
  } else {
    const userUrls = filterUserURLS(userId.id, urlDatabase);
    templateVars.userUrls = userUrls;
    res.render("urls_index", templateVars)
  }
});

//New TinyURL route

//edge cases to consider
// What would happen if a client requests a non-existent shortURL?
// What happens to the urlDatabase when the server is restarted?
// What type of status code do our redirects have? What does this status code mean?

app.get("/urls/new", (req, res) => {
  const templateVars= { 
    userId: req.cookies["user_id"] 
  };
  const userId = req.cookies["user_id"];
  if (userId === undefined) {
    res.redirect("/login")
  } else {
    res.render("urls_new", templateVars);
  }
});

app.post("/urls", (req, res) => {
  console.log(req.body, "req body");  // Log the POST request body to the console
  const userId = req.cookies["user_id"];
  const url = req.body;
  const newUrlKey = generateRandomString()
  urlDatabase[newUrlKey] = { 
    "longURL": url.longURL,
    "userID": userId.id
  }
  res.redirect(`/urls/${newUrlKey}`); 
});

//Delete TinyURL route

app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.cookies["user_id"];
  if (userId === undefined) {
    res.redirect("/login")
  } else if (urlDatabase[req.params.shortURL].userID !== userId.id) {
    res.status(400).send("Not allowed")
  } else {
  console.log("deleting" + req.params.shortURL);
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
  }
});

//Edit existing TinyURL path

app.post("/urls/edit", (req, res) => {
  const userId = req.cookies["user_id"];
  if (userId === undefined) {
    res.redirect("/login")
  } else if (urlDatabase[req.params.shortURL].userID !== userId.id) {
    res.status(400).send("Not allowed")
  } else {
  const url = req.body;
  //getting rid of the old Short URL
  for (const key in urlDatabase) {
    if (urlDatabase[key].longURL === url.longURL)
    delete urlDatabase[key];
  }
  //making the new ShortURL
  const newUrlKey = generateRandomString()
  urlDatabase[newUrlKey] = { 
    "longURL": url.longURL,
    "userID": userId.id
  }
  res.redirect(`/urls/${newUrlKey}`);
}
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    userId: req.cookies["user_id"],
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render("urls_show", templateVars);
});

//shortURL redirect route
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  console.log(longURL)
  //res.redirect("/")
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



