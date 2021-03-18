const express = require("express");
//looks like we might change this to - process.env.PORT || 8080
const PORT = 8080;
const bodyParser = require("body-parser");
//const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const app = express();
//app.use(cookieParser());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  //this is the name of the cookie in the browser
  name: 'tinyAppSession',
  keys: ['secretkey1', 'secretkey2']
}));

//Helper functions 
const { generateRandomString, checkId, filterUserURLS } = require('./helpers')


//DATABASES

const users = {
};

const urlDatabase = {
};

//ROUTES

//Register new user path
app.get("/register", (req, res) => {
  const templateVars= {
    userId: req.session.user_id
  };
  res.render("register", templateVars);
});

//Register submit handler
//TO DO add logic preventing double ups of the same user id
app.post("/register", (req, res) => {

  //tentative logic for preventing userId double ups. Will wait for this to come up in assignment
  // let newUserId = generateRandomString();
  // while(checkId(newUserId) !== false) {
  //   newUserId = generateRandomString();
  // }

  const id = generateRandomString();
  const email = req.body.userEmail;
  const password = req.body.userPassword;

  if (!email || !password) {
    //sending status code assistance from https://stackoverflow.com/questions/14154337/how-to-send-a-custom-http-status-message-in-node-express
    return res.status(400).send("Please enter a valid email and password");
  }
  
  if (checkId(email, users)) {
    return res.status(400).send("This email is already in use");
  }
    //asychronous hashing logic learned during W3D4 lecture from Andy Lindsay
    //https://github.com/andydlindsay/mar01-2021/blob/master/w03d04/server.js
  bcrypt.genSalt(10)
    .then((salt) => {
      return bcrypt.hash(password, salt);
    })
    .then((hash) => {
      users[id] = {
        "id": id,
        "email": email,
        "password": hash
      };
      req.session.user_id = users[id] //users[users[id]];
      console.log(users); //debugging
      return res.redirect("/urls");
    });

});

//User home page 


//Login path

app.get("/login", (req, res) => {
  const templateVars = {
    userId: req.session.user_id
    //userId: req.cookies["user_id"],
  };
  res.render("login", templateVars);
});

//Login submit handler
app.post("/login", (req, res) => {
  //DONE TO DO: add an "if else " email matches && password match statement to reach the user home page route
  const email = req.body.userEmail;
  const password = req.body.userPassword;
  //console.log(hashedPassword);
  //let id = undefined;

  if (checkId(email, users)) {
    //assistance with this part from the W3D4 lecture from Andy Lindsay
    //(altered to match my existing logic)
    //https://github.com/andydlindsay/mar01-2021/blob/master/w03d04/server.js
    let userMatch = checkId(email, users);
    bcrypt.compare(password, users[userMatch].password)
      .then((result) => {
        if (result) {
          req.session.user_id = users[userMatch];
        //res.cookie('user_id', users[userMatch]);
          res.redirect("/urls");
        } else {
        res.status(403).send("Password not correct")
      }
    })
  } else {
  res.status(403).send("Email not found. Please register a new account");
  }
});

//Logout path

app.get("/logout", (req, res) => {
  res.render("/login");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


// /url_index page

app.get("/urls", (req, res) => {
  const templateVars = {
    userId: req.session.user_id,
    //userId: req.cookies["user_id"],
    urls: urlDatabase, 
  };
  const userId = req.session.user_id;
  if (userId === undefined) {
    res.redirect("/login");
  } else {
    const userUrls = filterUserURLS(userId.id, urlDatabase);
    templateVars.userUrls = userUrls;
    res.render("urls_index", templateVars);
  }
});

//New TinyURL route

//edge cases to consider
// What would happen if a client requests a non-existent shortURL?
// What happens to the urlDatabase when the server is restarted?
// What type of status code do our redirects have? What does this status code mean?

app.get("/urls/new", (req, res) => {
  const templateVars = {
    userId: req.session.user_id
    //userId: req.cookies["user_id"]
  };
  const userId = req.session.user_id;
  if (userId === undefined) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.post("/urls", (req, res) => {
  console.log(req.body, "req body");  // Log the POST request body to the console
  const userId = req.session.user_id;
  const url = req.body;
  const newUrlKey = generateRandomString();
  urlDatabase[newUrlKey] = {
    "longURL": url.longURL,
    "userID": userId.id
  };
  res.redirect(`/urls/${newUrlKey}`);
});

//Delete TinyURL route

app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.user_id;
  if (userId === undefined) {
    res.redirect("/login");
  } else if (urlDatabase[req.params.shortURL].userID !== userId.id) {
    res.status(400).send("Not allowed");
  } else {
    console.log("deleting" + req.params.shortURL);
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

//Edit existing TinyURL path

app.post("/urls/edit", (req, res) => {
  const userId = req.session.user_id;
  if (userId === undefined) {
    return res.redirect("/login");
  }

  //This isn't working yet
  if (urlDatabase[req.params.shortURL] === undefined) {
    return res.status(400).send("Page does not exist");
  }
  
  if (urlDatabase[req.params.shortURL].userID !== userId.id) {
    return res.status(400).send("Not allowed");
  } 

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
});

// edit shortURL display page
app.get("/urls/:shortURL", (req, res) => {

  const templateVars = { 
    userId: req.session.user_id,
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render("urls_show", templateVars);
});

//shortURL redirect route
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  console.log(longURL)
  res.redirect(longURL);
});

// Home page
app.get("/", (req, res) => {
  const templateVars = {
    userId: req.session.user_id,
    urls: urlDatabase, 
  };
  const userId = req.session.user_id;

  // If user is not logged in, redirects to login page
  if (userId === undefined) {
    return res.redirect("/login");
  }
  // If user is logged in, redirects to index page with user's urls 
  const userUrls = filterUserURLS(userId.id, urlDatabase);
  templateVars.userUrls = userUrls;
  res.render("urls_index", templateVars);

});


// Default page path
app.get("*", (req, res)=> {
  return res.status(400).send("Page does not exist");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//Do I need this?
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

