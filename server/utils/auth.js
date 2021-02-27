const jwt = require('jsonwebtoken');

// set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  // function for authenticating jwt 
  authMiddleware: function ({ req }) {
    // allows token to be sent via  req.query or headers
    let token = req.body.token || req.query.token || req.headers.authorization;
    
    // ["Bearer", "<tokenvalue>"]
    if (req.headers.authorization) {
      token = token
      .split(' ')
      .pop()
      .trim();
    }

    // if no token, return request object as in
    if (!token) {
      return req;
      //return res.status(400).json({ message: 'You have no token!' });
    }

    // verify token and get user data out of it. Check for secret match
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      console.log('Invalid token');
     // return res.status(400).json({ message: 'invalid token!' });
    }
    
    return req;

    // send to next endpoint
    //next();
  },
  // expects user object and adds info to token
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
