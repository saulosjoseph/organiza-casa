export { auth as middleware } from "@/src/infrastructure/auth/auth.config";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
