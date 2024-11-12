const jwt = require("jsonwebtoken");
const { GraphQLError } = require("graphql");

// set token secret and expiration date
const secret = "mysecretsshhhhh";
const expiration = "2h";

// Define AuthenticationError as a class that extends Error
class AuthenticationError extends GraphQLError {
  constructor(message) {
    super(message, {
      // Customize the error extensions for unauthenticated users
      extensions: {
        code: "UNAUTHENTICATED",
      },
    });
    this.name = "AuthenticationError";
  }
}

module.exports = {
  // Export the AuthenticationError class instead of a single instance
  AuthenticationError,

  // function for our authenticated routes
  authMiddleware: function ({ req }) {
    // allows token to be sent via  req.query or headers
    let token = req.body.token || req.query.token || req.headers.authorization;

    // ["Bearer", "<tokenvalue>"]
    if (token && token.startsWith("Bearer ")) {
      token = token.split(" ").pop().trim(); // Extract token part
    }

    if (!token) {
      return { user: null };
    }

    // verify token and get user data out of it
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      return { user: data };
    } catch (error) {
      console.log("Invalid token:", error);
      return { user: null };
    }
  },

  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
