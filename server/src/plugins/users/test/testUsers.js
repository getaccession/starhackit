const assert = require('assert');
const testMngr = require('test/testManager');
const Chance = require('chance');

let chance = new Chance();

describe('Users', function() {
  let client;

  before(async () => {
      await testMngr.start();
  });
  after(async () => {
      await testMngr.stop();
  });

  describe('Admin', () => {
    let models = testMngr.app.data.sequelize.models;
    let userModel = models.User;
    before(async () => {
      client = testMngr.client('admin');
      assert(client);
      let res = await client.login();
      assert(res);
    });
    it('should get all users', async () => {
      const users = await client.get('v1/users');
      assert(users);
      assert(Number.isInteger(users.count));
      assert(users.data);

      console.log(users);
      for(let user of users.data){
        const userGetOne = await client.get(`v1/users/${user.id}`);
        assert(userGetOne);
        //console.log('user ' , userGetOne);
        //assert(_.isEqual(user, userGetOne));
        assert(user);
        //console.log('user:', userGetOne);
        assert(userGetOne.id);
        assert(userGetOne.username);
        assert(userGetOne.createdAt);
        assert(userGetOne.updatedAt);
        assert(!userGetOne.password);

        assert(!userGetOne.passwordHash);
      }
    });
    it('should get all users', async () => {
      const users = await client.get('v1/users?search=mail');
      assert(users);
      assert(Number.isInteger(users.count));
      assert(users.data);
      console.log(users);
    });
    it('should get all users with filter ASC', async () => {
      let res = await client.get('v1/users?offset=1&order=ASC&limit=2');
      assert.equal(res.data.length, 2);
      //console.log(res.data[0])
      assert(res.data[0].id);
    });
    it('should get all users with filter DESC', async () => {
      let res = await client.get('v1/users?offset=10&limit=2');
      assert.equal(res.data.length, 2);
    });

    it('should patch a user', async () => {
      let username = chance.name();
      let userConfig = {
        username: username,
        age: "55",
        email: username + "@mail.com",
        authProvider: {
          name: "facebook",
          authId: "1234567890"
        }
      };
      let userCreated = await userModel.createUserInGroups(userConfig, ["User"]);
      assert(userCreated);
      const ageUpdated = {
        age: "58"
      };
      let updatedUser = await client.patch(`v1/users/${userCreated.id}`, ageUpdated);
      assert(updatedUser);
      assert.equal(updatedUser.age, ageUpdated.age);
      });

    it.skip('should not create a new user with missing username', async () => {
      try {
        await client.post('v1/users');
        assert(false);
      } catch(err){
        assert(err);
        assert.equal(err.response.status, 400);
      }
    });
  });
  describe('User Basic ', () => {
    before(async () => {
      client = testMngr.client('alice');
      assert(client);
      let res = await client.login();
      assert(res);
    });
    it('should not list on all users', async () => {
      try {
        await client.get('v1/users');
        assert(false);
      } catch(err){
        assert(err);
        assert.equal(err.response.status, 401);
      }
    });
  });
});
