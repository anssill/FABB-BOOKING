// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const handler = NextAuth({
  providers: [
    // Google OAuth — for Owner + Managers
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Email + Password — for Staff
    CredentialsProvider({
      name: 'Staff Login',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
          email:    credentials.email,
          password: credentials.password,
        })
        if (error || !data.user) return null
        // Fetch role
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        if (!profile?.active) return null
        return {
          id:    data.user.id,
          email: data.user.email!,
          name:  profile.name || data.user.email!,
          role:  profile.role,
          image: profile.avatar_url,
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        // Check if profile exists, create if not
        const { data: existing } = await supabaseAdmin
          .from('profiles')
          .select('id, active')
          .eq('email', user.email!)
          .single()

        if (existing && !existing.active) {
          return false // Blocked user
        }

        if (!existing) {
          // Auto-register Google user in Supabase auth
          const { data: authData } = await supabaseAdmin.auth.admin.createUser({
            email:         user.email!,
            email_confirm: true,
            user_metadata: { full_name: user.name, avatar_url: user.image },
          })
          // Profile auto-created by trigger — set owner if it's the owner email
          if (user.email === process.env.NEXT_PUBLIC_OWNER_EMAIL) {
            await supabaseAdmin
              .from('profiles')
              .update({ role: 'owner', avatar_url: user.image })
              .eq('email', user.email!)
          }
        }
      }
      return true
    },

    async jwt({ token, user }) {
      if (user) {
        token.role  = (user as any).role
        token.id    = user.id
      }
      // Always fetch fresh role from DB
      if (token.email) {
        const { data } = await supabaseAdmin
          .from('profiles')
          .select('role, id, name, avatar_url')
          .eq('email', token.email)
          .single()
        if (data) {
          token.role      = data.role
          token.id        = data.id
          token.name      = data.name
          token.picture   = data.avatar_url
        }
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role
        ;(session.user as any).id  = token.id
      }
      return session
    },
  },

  pages: {
    signIn:  '/login',
    error:   '/login',
  },

  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
