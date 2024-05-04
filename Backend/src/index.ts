import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './schema/authSchema';
import resolvers from './resolvers/authResolver';
import connectDB from './config/database';

import dotenv from 'dotenv';
dotenv.config();

const app = express();

async function createServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Create an Apollo Server instance
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req }) => ({ req }) // Pass context to resolvers
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
