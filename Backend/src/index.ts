import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';

import { typeDefs as userTypeDefs } from './schema/userSchema';
import { resolvers as userResolvers } from './resolvers/userResolver';
import { typeDefs as authTypeDefs } from './schema/authSchema';
import { resolvers as authResolvers } from './resolvers/authResolver';

import connectDB from './config/database';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

async function createServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Merge type definitions and resolvers
    const mergedTypeDefs = mergeTypeDefs([userTypeDefs, authTypeDefs]);
    const mergedResolvers = mergeResolvers([userResolvers, authResolvers]);

    // Create an executable schema
    const schema = makeExecutableSchema({
      typeDefs: mergedTypeDefs,
      resolvers: mergedResolvers,
    });

    // Create an Apollo Server instance
    const server = new ApolloServer({
      schema,
      context: async ({ req }) => {
        const token = req.headers.authorization || '';
        if (token) {
          try {
            const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'your_secret_key');
            return { user: decoded };
          } catch (error) {
            console.error('Failed to verify token:', error);
            return { user: null };
          }
        }
        return { user: null };  // No token provided
      }
    });

    // Start the Apollo Server
    await server.start();

    // Apply Apollo middleware to the Express application
    server.applyMiddleware({ app, path: '/graphql' });

    // Start the Express server
    app.listen(4000, () => console.log('Server running at http://localhost:4000/graphql'));
  } catch (error) {
    console.error('Error setting up the server:', error);
  }
}

createServer();