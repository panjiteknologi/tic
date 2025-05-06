import Credentials from "next-auth/providers/credentials";
import axios from "axios";
import type { NextAuthConfig } from "next-auth";

export default {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        try {
          console.log("CRES : ", credentials);

          const response = await axios.post(
            "https://erp.tsicertification.com/client/authenticate",
            {
              params: {
                username: credentials?.email,
                password: credentials?.password,
              },
            }
          );

          console.log("RES Auth:", response.data);

          if (response.data && response.data.result) {
            return {
              id: String(response.data.result.uid),
              uid: response.data.result.uid,
              username: response.data.result.username,
              email: response.data.result.username,
              partner_name: response.data.result.partner_name,
              access_token: response.data.result.access_token,
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
