require('dotenv').config({ path: '.env.test' });
const app = require('../app');
let server;

beforeAll(async () => {
  server = app.listen(3001); // Use different port for testing
  await new Promise(resolve => setTimeout(resolve, 1000));
});

afterAll(async () => {
  await server.close();
});
