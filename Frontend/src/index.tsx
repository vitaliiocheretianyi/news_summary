// src/index.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import client from './config/Client'; // Import the Apollo Client instance
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
