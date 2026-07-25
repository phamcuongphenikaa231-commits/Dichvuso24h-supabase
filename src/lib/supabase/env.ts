/**
 * Supabase environment variable validation.
 *
 * Validates that required Supabase environment variables are present
 * and exports them for use by client/server factories.
 *
 * IMPORTANT: Never log or expose the full publishable key.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url) {
  throw new Error(
    '[Supabase] Missing environment variable: NEXT_PUBLIC_SUPABASE_URL. ' +
      'Please add it to your .env.local file.'
  );
}

if (!key) {
  throw new Error(
    '[Supabase] Missing environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. ' +
      'Please add it to your .env.local file.'
  );
}

export const supabaseUrl: string = url;
export const supabasePublishableKey: string = key;
