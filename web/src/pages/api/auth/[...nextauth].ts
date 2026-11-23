import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/database';
import User from '@/lib/models/User';
import { DEMO_ENABLED, ensureDemoUser, seedDemoDataIfEmpty } from '@/lib/demo';

export const authOptions: NextAuthOptions = {
  session: { strategy: `jwt` },
  // Read from NEXTAUTH_SECRET; next-auth refuses to start in production without it.
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === `development`,
  pages: {
    signIn: `/login`,
    error: `/login`,
  },
  providers: [
    // One-click portfolio demo: signs in as the shared demo doctor, no password.
    CredentialsProvider({
      id: `demo`,
      name: `Démo`,
      credentials: {},
      async authorize() {
        if (!DEMO_ENABLED) return null;
        await dbConnect();
        const user = await ensureDemoUser();
        await seedDemoDataIfEmpty();
        return { id: String(user._id), email: user.email, name: user.pseudo };
      },
    }),
    CredentialsProvider({
      name: `credentials`,
      credentials: {
        email: { label: `Email`, type: `text` },
        password: { label: `Password`, type: `password` },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        await dbConnect();
        const user = await User.findOne({ email: credentials.email });
        if (
          !user ||
          !(await bcrypt.compare(credentials.password, user.password))
        )
          return null;
        // Only expose non-sensitive fields: this object ends up in the JWT.
        return { id: String(user._id), email: user.email, name: user.pseudo };
      },
    }),
  ],
};

export default NextAuth(authOptions);
