const { assert } = require('chai');

const { checkId } = require('../helpers.js');

const testUsers = {
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
};

//NOTE: my getUsersByEmail function is called checkId because I imagined it could also be useful to prever the same random id getting applied to a user or url
describe('checkId', function() {
  it('should return a user with valid email', function() {
    const user = checkId("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.strictEqual(user, expectedOutput);
  });

  it('should return false if the email isn\'t in the database', function() {
    const user = checkId("user3@example.com", testUsers);
    const expectedOutput = false;
    assert.strictEqual(user, expectedOutput);
  });
});