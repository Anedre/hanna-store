import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { queryByIndex, TABLES } from "@/lib/dynamo";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        dni: { label: "DNI", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.dni || !credentials?.password) {
          throw new Error("DNI y contrasena son requeridos");
        }

        const dni = credentials.dni as string;
        const password = credentials.password as string;

        // Query users by DNI via dni-index GSI
        const users = await queryByIndex<Record<string, any>>(
          TABLES.users,
          "dni-index",
          "dni",
          dni,
          { limit: 1 }
        );

        const user = users[0];

        if (!user) {
          throw new Error("Credenciales invalidas");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          throw new Error("Credenciales invalidas");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          dni: user.dni,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.dni = user.dni;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.dni = token.dni;
      }
      return session;
    },
  },
  pages: {
    signIn: "/iniciar-sesion",
  },
});
