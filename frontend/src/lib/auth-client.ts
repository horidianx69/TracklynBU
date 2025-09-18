import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: "http://localhost:4000/api/auth", // backend
   plugins: [inferAdditionalFields({
      user: {
        role: {
          type: "string"
        }
      }
  })],
});

export const { signIn, signUp, useSession, signOut } = authClient;
