import { betterAuth } from "better-auth";
import { Pool, PoolConfig } from "pg";
import { customSession } from "better-auth/plugins";
import { signInEmail } from "better-auth/api";
import { passkey } from "@better-auth/passkey"
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
    database: new Pool({
        connectionString:process.env.DATABASE_URL!,
    }),
    trustedOrigins: [
        "http://localhost:3000",
        "https://eventra-henna.vercel.app",
    ],
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            tenantId: {
                type: "string",
                required: true,
                input: true,      // allow callers to supply this on sign-up
            },
            role: {
                type: "string",
                required: false,
                defaultValue: "STAFF",
                input: true,      // allow callers to override the default
            },
        },
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 2*60, // Cache duration in seconds (5 minutes),
            strategy: "jwt"

        }
    },
    plugins: [
        // passkey(),
        // signInEmail(async())
        nextCookies(),
        customSession(async ({ user, session }) => {
            // const roles = []
            return {
                // roles,
                user: {
                    ...user,
                    newField: "newField",
                },
                session
            };
        }),
    ],
    
});