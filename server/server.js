const express = require('express');
const path = require('path');
// require mongodb connection
const db = require('./config/connection');
// don't think we'll need these
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

// express middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.use(routes);

// looks for db to open - upon successfully connection, start the server
db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});
