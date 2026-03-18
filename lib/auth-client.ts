import { customSessionClient } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth"; // Import the auth instance as a type
import {createAuthClient} from "better-auth/client"

export const authClient = createAuthClient({
    plugins: [customSessionClient<typeof auth>()],
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: process.env.NEXT_PUBLIC_APP_URL!
    
});

