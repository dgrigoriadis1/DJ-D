import { NextAuthOptions } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import SpotifyProvider from 'next-auth/providers/spotify'
import { prisma } from './db'

const SPOTIFY_SCOPES = [
  'user-read-email',
  'user-read-private',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private',
].join(' ')

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      }),
    })

    const data = await response.json()

    if (!response.ok) throw new Error(data.error)

    return {
      ...token,
      accessToken: data.access_token as string,
      refreshToken: (data.refresh_token as string) ?? token.refreshToken,
      expiresAt: Date.now() + (data.expires_in as number) * 1000,
    }
  } catch (error) {
    console.error('Failed to refresh Spotify access token:', error)
    return { ...token, error: 'RefreshAccessTokenError' }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: { scope: SPOTIFY_SCOPES },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Initial sign in — persist tokens and upsert user in DB
      if (account && profile) {
        const spotifyProfile = profile as {
          id: string
          display_name?: string
          email?: string
          images?: { url: string }[]
        }

        // Upsert user record in our database
        const user = await prisma.user.upsert({
          where: { spotifyId: spotifyProfile.id },
          update: {
            name: spotifyProfile.display_name ?? null,
            email: spotifyProfile.email ?? null,
            image: spotifyProfile.images?.[0]?.url ?? null,
          },
          create: {
            spotifyId: spotifyProfile.id,
            name: spotifyProfile.display_name ?? null,
            email: spotifyProfile.email ?? null,
            image: spotifyProfile.images?.[0]?.url ?? null,
          },
        })

        return {
          ...token,
          accessToken: account.access_token!,
          refreshToken: account.refresh_token!,
          expiresAt: account.expires_at! * 1000,
          userId: user.id,
          spotifyId: spotifyProfile.id,
        }
      }

      // Token is still valid — return as-is
      if (Date.now() < token.expiresAt) {
        return token
      }

      // Token expired — refresh it
      return refreshAccessToken(token as Parameters<typeof refreshAccessToken>[0])
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.userId = token.userId
      if (token.error) session.error = token.error
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
}
