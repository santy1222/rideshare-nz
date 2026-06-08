// All sensitive API keys live here — only use in server-side code (API routes, Server Components).
// Never use NEXT_PUBLIC_ prefix for anything in this file.

export const env = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!, // safe: Supabase URL is public by design
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  // Add future keys here, e.g.:
  // stripe: {
  //   secretKey: process.env.STRIPE_SECRET_KEY!,
  //   webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  // },
} as const;
