const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) =>{
      if (context.user){
        const returnUser = await User.findOne({_id: context.user._id})
        return returnUser;
      }
      throw new AuthenticationError('Please log in');
    }
  },

  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No account with that email');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Please double check your credentials');
      }

      const token = signToken(user);

      return { token, user };
    },

    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },

    saveBook: async (parent, args) => {
      if (context.user){
        const bookSave = await User.findOneAndUpdate({_id: context.user._id}, {$addToSet: {savedBooks: args.input}}, {new: true})
        return bookSave;
      }
    },

    removeBook: async (parent, args) => {
      if (context.user){
        const bookRemove = await User.findOneAndUpdate({_id: context.user._id}, {$pull: {savedBooks: args.bookId}}, {new: true})
        return bookRemove;
      }
    }
  },
  
};

module.exports = resolvers;
