
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";



const publicroutes = [] as string[];


const authRoutes = ["/login", "/register"]


const apiAuthPrefix = "/api/auth";

const DEFAULT_LOGIN_REDIRECT = "/login";





export default async function proxy(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    // THIS IS NOT SECURE!
    // This is the recommended approach to optimistically redirect users
    // We recommend handling auth checks in each page/route

    const { nextUrl } = req;


 


    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    const isAuthRoute = authRoutes.some((route) => {
        return nextUrl.pathname.startsWith(route);
    });

    // Check if route is public - handle home page and other routes
    const isPublicRoute = publicroutes.some((route) => {
        return nextUrl.pathname.startsWith(route);
    });

    console.log(isApiAuthRoute, isAuthRoute,isPublicRoute, "routes")

    if (isApiAuthRoute) {
        return NextResponse.next();
    }

    if (isAuthRoute) {
        if (session) {
            return NextResponse.redirect(new URL("/", req.url));
        }
        return NextResponse.next();
    }

    if (isPublicRoute) {
        return NextResponse.next();
    }

    // All remaining routes require an authenticated session.
    if (!session) {
        return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, req.url));
    }

    return NextResponse.next();
}




export const config = {
    matcher: [
        // "/((?!api|_next/static|_next/image|favicon.ico).*)",
        "/",
        "/admin/:path*",
    ],
};
