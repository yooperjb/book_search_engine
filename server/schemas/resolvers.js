const { AuthenticationError } = require('apollo-server-express');
// import models - don't think Book is required
const { User, Book } = require('../models');

const resolvers = {
    // queries
    Query: {
        // get single user from context
        me: async (parent, args, context) => {
            // if user exists
            if (context.user) {
                // I believe something should be in the findOne()
                const userData = await User.findOne({ _id: context.user._id })
                // exclude mongoose id and user password
                .select('-__v -password')
                
                return userData
            }
        }
    }, 

    // mutations
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            // token will go here
            // add token to return as well
            return { user };
        },

        login: async (parent, {email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError("Incorrect Credentials");
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError("Incorrect Credentials");
            }

            // add token here
            return { user };
        }, 

        saveBook: async (parent, { userId, book }, context ) => {
            console.log("Book: ", book);
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: userId },
                    { $push: { savedBooks: { book }}},
                    { new: true, runValidators: true }
                );

                return updatedUser;
            }

            throw new AuthenticationError('You need to be logged in!');
        },

        removeBook: async (parent, { userId, bookId }, context ) => {
            console.log("DeleteBook: ", book);
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
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