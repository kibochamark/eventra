import { betterAuth } from "better-auth";
import { Pool, PoolConfig } from "pg";
import { customSession } from "better-auth/plugins";
import { signInEmail } from "better-auth/api";
import { passkey } from "@better-auth/passkey"
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
    database: new Pool({
        connectionString:"postgresql://eventra-staging_owner:npg_8nplz6KJrPjb@ep-summer-silence-a44pqjv8-pooler.us-east-1.aws.neon.tech/eventra-staging?sslmode=require&channel_binding=require"
    }),
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