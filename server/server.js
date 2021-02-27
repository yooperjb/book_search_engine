const express = require('express');
const path = require('path');
// connect to MongoDB
const db = require('./config/connection');
// import ApolloServer
const { ApolloServer } = require('apollo-server-express');
const { authMiddleware } = require('./utils/auth');
// dont think we need this
//const routes = require('./routes');

// import typeDefs and resolvers from schemas
const { typeDefs, resolvers } = require('./schemas');

const app = express();
const PORT = process.env.PORT || 3001;

// express middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// create a new Apollo server and pass in our schema data
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // allows headers to pass context to resolvers on incoming request
  // performs authentication check on every request
  context: authMiddleware
});

// integrate our Apollo server with the Express application as middleware
// this creates the special /graphql endpoint for accessing entire API
server.applyMiddleware({ app });

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

//app.use(routes);

// looks for db to open - upon successfully connection, start the server
db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`🌍 Now listening on localhost:${PORT}`)
    // log where we can got to test our GQL API
    console.log(`Use GraphQL at http://locatlhost:${PORT}${server.graphqlPath}`);
  });
});
