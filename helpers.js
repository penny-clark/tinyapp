//HELPER FUNCTIONS

//for making unique ids
const generateRandomString = () => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTYUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  for (let i = 0; i < 6; i++) {
    let randomNumber = Math.floor(Math.random() * 62);
    result += characters[randomNumber];
  }
  return result;
};

//for checking for duplicates in the users database
const checkId = (compareItem, database) => {
  let duplicate = false;
  for (const user in database) {
    if (database[user].id === compareItem) {
      duplicate = database[user].id;
    } else if (database[user].email === compareItem) {
      duplicate = database[user].id;
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
};

module.exports = { generateRandomString, checkId, filterUserURLS };