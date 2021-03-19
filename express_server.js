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
const { generateRandomString, checkId, filterUserURLS } = require('./helpers');

//DATABASES

const users = {
};

const urlDatabase = {
};

//ROUTES

//REGISTER 

//Register page
app.get("/register", (req, res) => {
  const templateVars = {
    userId: req.session.user_id
  };
  //Added feature - if logged in user tries to access register page, they are redirected to their home page
  const userId = req.session.user_id;
   if (userId) {
     return res.redirect("/urls")
   };
  res.render("register", templateVars);
});

//Register submit handler
app.post("/register", (req, res) => {

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
  //asychronous hashing logic learned during W3D4 lecture by Andy Lindsay https://github.com/andydlindsay/mar01-2021/blob/master/w03d04/server.js
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
      req.session.user_id = users[id];
      console.log(users); //debugging
      return res.redirect("/urls");
    });

});

//LOGIN

//Login page
app.get("/login", (req, res) => {
  const templateVars = {
    userId: req.session.user_id
  };
  //Added feature - if logged in user tried to access the login page, they are redirected to their home page
  const userId = req.session.user_id;
  if (userId) {
    return res.redirect("/urls")
  };
  res.render("login", templateVars);
});

//Login submit handler
app.post("/login", (req, res) => {
  const email = req.body.userEmail;
  const password = req.body.userPassword;
  const userMatch = checkId(email, users);

  if (userMatch === false) {
    return res.status(403).send("Email not found. Please register a new account");
  }

  //assistance with this part from the W3D4 lecture from Andy Lindsay (altered to match my existing logic) https://github.com/andydlindsay/mar01-2021/blob/master/w03d04/server.js
  bcrypt.compare(password, users[userMatch].password)
    .then((result) => {
      if (result) {
        req.session.user_id = users[userMatch];
        res.redirect("/urls");
      } else {
      res.status(403).send("Password not correct")
      }
    })
   
});

//LOGOUT

//Logout page
app.get("/logout", (req, res) => {
  res.render("/login");
});

//Logout request handler
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


//URLS (User homepage)

//Urls page
app.get("/urls", (req, res) => {
  const templateVars = {
    userId: req.session.user_id,
    urls: urlDatabase, 
  };

  const userId = req.session.user_id;
  //if user isn not logged in, redirects to login page
  if (userId === undefined) {
    return res.redirect("/login");
  } 
  //if user is logged in, shows the urls index page with only the user's urls
  const userUrls = filterUserURLS(userId.id, urlDatabase);
  templateVars.userUrls = userUrls;
  res.render("urls_index", templateVars);
  
});

//NEW SHORT URL

//edge cases to consider
// What would happen if a client requests a non-existent shortURL?
// What happens to the urlDatabase when the server is restarted?
// What type of status code do our redirects have? What does this status code mean?
//New ShortURL page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    userId: req.session.user_id
  };
  const userId = req.session.user_id;
  if (userId === undefined) {
    return res.status(403).send("Please log in")
  } else {
    res.render("urls_new", templateVars);
  }
});

//New ShortURL request handler
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  const url = req.body;
  const newUrlKey = generateRandomString();
  urlDatabase[newUrlKey] = {
    "longURL": url.longURL,
    "userID": userId.id
  };
  res.redirect(`/urls/${newUrlKey}`);
});

//DELETE SHORT URL

//Delete ShortURL request handler
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.user_id;
  const shortUrl = req.params.shortURL;

  if (userId === undefined) {
    return res.redirect("/login");
  };
  if (urlDatabase[shortUrl].userID !== userId.id) {
    return res.status(400).send("Not allowed");
  };
  delete urlDatabase[shortUrl];
  res.redirect("/urls");
});

//EDIT SHORT URL

//Edit ShortURL request handler
app.post("/urls/edit", (req, res) => {
  const userId = req.session.user_id;
  if (userId === undefined) {
    return res.redirect("/login");
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

// Edit shortURL display page
app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    return res.status(404).send("Page does not exist");
  } else {
  const templateVars = { 
    userId: req.session.user_id,
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render("urls_show", templateVars);
}
});

// ShortURL Magic Redirection link

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    return res.status(404).send("Page does not exist");
  } else {
  const longUrl = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longUrl);
  }
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

  // If user is logged in, redirects to custom index page with user's urls 
  const userUrls = filterUserURLS(userId.id, urlDatabase);
  templateVars.userUrls = userUrls;
  res.render("urls_index", templateVars);

});


// Default page path
app.get("*", (req, res)=> {
  return res.status(404).send("Page does not exist");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//Do I need this?
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

