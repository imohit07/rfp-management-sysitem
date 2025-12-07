const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL');
    client.end();
  })
  .catch(err => {
    console.error('Error connecting:', err.stack);
  });
