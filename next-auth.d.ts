import 'next-auth'

declare module 'next-auth' {
    interface Session{
        user: {
            id: string,
            email: string,
            firstName: string,
            lastName: string,
          }
          accessToken: string
    }

    interface User {
        id: string,
        email: string,
        firstName: string,
        lastName: string,
      }
}