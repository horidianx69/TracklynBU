import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:4000/api/auth", // backend
});

export const { signIn, signUp, useSession, signOut } = authClient;
