import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
    accessToken: string;
    expiresAt: number;
  }

  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    token: string;
  }

  interface JWT {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    accessToken: string;
    expiresAt: number;
  }
}
