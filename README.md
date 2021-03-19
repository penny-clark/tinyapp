# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows logged in users to shorten long URLs (à la bit.ly).

TinyApp will return a personalize list of shortened URLS for each user. The user can make new short URLS, delete their existing short URLS or edit their URLs to get a different randomly generated TinyApp id.

Users' passwords are stored with bcrypt and their cookies are encrypted with cookie-session. 

## Final Product

!["Screenshot of make a new ShortURL page"](https://github.com/penny-clark/tinyapp/blob/master/docs/create-ShortURL.png)
!["Screenshot of user's URLs homepage"](https://github.com/penny-clark/tinyapp/blob/master/docs/user-homepage.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.