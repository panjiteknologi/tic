import { env } from "@/env";
import Credentials from "next-auth/providers/credentials";
import axios from "axios";
import type { NextAuthConfig } from "next-auth";

const baseUrl = env.NEXT_PUBLIC_ENDPOINT_URL;

export default {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "username" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        try {
          const response = await axios.post(
            `${baseUrl}/audit_status/login_user`,
            {
              username: credentials?.username,
              password: credentials?.password,
            }
          );

          if (response.data?.data?.message === "Login Successfully") {
            return {
              // id: String(response.data.result.uid),
              access_token: response.data.data,
            };
          }

          return null;
        } catch (e: any) {
          const errorMessage =
            e?.response?.data?.message || "Authentication failed";
          throw new Error(errorMessage);
        }
      },
    }),
  ],
} satisfies NextAuthConfig;
