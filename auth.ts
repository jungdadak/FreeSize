import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        // user.id가 존재하는지 확인
        token.role = user.role;
        token.id = user.id.toString();
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('이메일과 비밀번호를 입력해주세요');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email.toString(), // email을 string으로 명시적 변환
          },
        });

        if (!user) {
          throw new Error('등록되지 않은 이메일입니다');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password.toString(), // password를 string으로 명시적 변환
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('비밀번호가 일치하지 않습니다');
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name || '',
          role: user.role,
        };
      },
    }),
  ],
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);
