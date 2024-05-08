import jwt from 'jsonwebtoken';

export const verifyToken = (token: string) => {
    if (!token) {
      throw new Error("Unauthorized");
    }
    try {
      jwt.verify(token, 'your_secret_key'); // Use your JWT secret key
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  };