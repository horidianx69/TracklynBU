import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { sendEmail } from "./mailer.js"; // Your nodemailer email function

const client = new MongoClient(process.env.MONGO_URI);

export const auth = betterAuth({
  baseURL: "http://localhost:5173", // Your frontend's URL
  database: mongodbAdapter(client.db()),

  emailAndPassword: {
    enabled: true,
    // ✅ This option stays here
    requireEmailVerification: true, 
  },

  // ✅ The sendVerificationEmail function should be in this object
  emailVerification: {
      // ✅ Add this line to send the email immediately on signup
    sendOnSignUp: true,
    // ✅ Add this line to automatically log the user in after they click the link
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await sendEmail(
          user.email,
          "Verify Your Email Address for Tracklyn App",
          `<h1>Welcome!</h1><p>Please click this link to verify your email: <a href="${url}">${url}</a></p>`
        );
      } catch (error) {
        console.error("Failed to send verification email:", error);
      }
    },
  },

  trustedOrigins: ["http://localhost:4000", "http://localhost:5173"],

  user: {
    additionalFields: {
      role: {
        type: "enum",
        enum: ["student", "teacher", "admin"],
        required: true,
        defaultValue: "student",
        input: true,
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!user.email.endsWith("@bennett.edu.in")) {
            throw new APIError("BAD_REQUEST", {
              message: "Only @bennett.edu.in emails are allowed to sign up.",
            });
          }
          return { data: user };
        },
      },
    },
  },
});