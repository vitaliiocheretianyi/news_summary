import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { User } from './models/User'; 
import { makeExecutableSchema } from '@graphql-tools/schema';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';

import { typeDefs as userTypeDefs } from './schema/userSchema';
import { resolvers as userResolvers } from './resolvers/userResolver';
import { typeDefs as authTypeDefs } from './schema/authSchema';
import { resolvers as authResolvers } from './resolvers/authResolver';
import { typeDefs as userInterestDefs } from './schema/userInterestSchema';
import { resolvers as userInterestResolvers } from './resolvers/userInterestResolver';
import { typeDefs as topicDefs } from './schema/topicSchema';
import { resolvers as topicResolvers } from './resolvers/topicResolver';

import connectDB from './config/database';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

const cors = require('cors');
dotenv.config();

const app = express();

interface DecodedToken extends JwtPayload {

  userId: string;
}

async function createServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Merge type definitions and resolvers
    const mergedTypeDefs = mergeTypeDefs([userTypeDefs, authTypeDefs, userInterestDefs, topicDefs]);
    const mergedResolvers = mergeResolvers([userResolvers, authResolvers, userInterestResolvers, topicResolvers]);

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
            const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET) as DecodedToken;
            console.log("User" + JSON.stringify(decoded));
    
            // Fetch user from MongoDB using Mongoose
            const user = await User.findOne({ _id: decoded.id });
    
            if (user) {
              console.log("User found");
              return { user }; // User found, pass user object to context
            } else {
              console.log("User not found");
              return { user: null }; // User not found in database
            }
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

    const corsOptions = {
      origin: process.env.ORIGIN_URI, // Ensure this matches the frontend URL
      credentials: true, // This allows cookies to be sent cross-origin
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      allowedHeaders: ['Content-Type', 'Authorization'],
    };
    
    app.use(cors(corsOptions));
    server.applyMiddleware({ app, path: '/graphql' });
    
    app.listen({ port: 4000 }, () =>
      console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
    );
    
  } catch (error) {
    console.error('Error setting up the server:', error);
  }
}

createServer();