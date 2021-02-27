// use graphql error handling for client
const { AuthenticationError } = require('apollo-server-express');
// import models - don't think Book is required
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    // queries
    Query: {
        // get single user - check authentication from context
        me: async (parent, args, context) => {
            // if authenticated user exists
            console.log("context:", context.user);
            if (context.user) {
                
                const userData = await User.findOne({ _id: context.user._id })
                // exclude mongoose id and user password
                .select('-__v -password')
                
                return userData
            }
            // if user does not exist
            throw new AuthenticationError('Not Logged In');
        }
    }, 

    // mutations
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            // create and sign user token
            const token = signToken(user)
            
            return { token, user };
        },

        login: async (parent, {email, password }) => {
            const user = await User.findOne({ email });

            // use generic client error message if incorrect user
            if (!user) {
                throw new AuthenticationError("Incorrect Credentials");
            }

            const correctPw = await user.isCorrectPassword(password);

            // use generic client error message if incorrect pass
            if (!correctPw) {
                throw new AuthenticationError("Incorrect Credentials");
            }

            // create and sign user token
            const token = signToken(user);
            return { token, user };
        }, 

        saveBook: async (parent, { userId, book }, context ) => {
            console.log("Book: ", book);
            // check for logged-in user
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: userId },
                    { $push: { savedBooks: { book }}},
                    {new: true}
                    //{ new: true, runValidators: true }
                );

                return updatedUser;
            }

            throw new AuthenticationError('You need to be logged in!');
        },

        removeBook: async (parent, { userId, bookId }, context ) => {
            console.log("DeleteBook: ", book);
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: userId },
                    { $pull: { savedBooks: { bookId: bookId } } },
                    { new: true }
                );

                return updatedUser;
            }
        }
    }
};

module.exports = resolvers;