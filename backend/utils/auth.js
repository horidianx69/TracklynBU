import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
const client = new MongoClient(process.env.MONGO_URI);
export const auth = betterAuth({
   database: mongodbAdapter(client.db()), 
   emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ,
      clientSecret: process.env.GITHUB_CLIENT_SECRET ,
    },
     google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
   trustedOrigins: [
    "http://localhost:4000", // backend
    "http://localhost:5173", // frontend (Vite)
  ],
 
});