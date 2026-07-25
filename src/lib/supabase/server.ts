import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseUrl, supabasePublishableKey } from './env';

/**
 * Creates a Supabase client for use in Server Components,
 * Server Actions, and Route Handlers.
 *
 * Next.js 15 uses an async `cookies()` API, so this factory
 * is itself async.
 *
 * Cookie writes may fail silently inside Server Components
 * (which are read-only). This is expected and handled by
 * the try/catch in the `set` callback.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // In Server Components, cookies cannot be set.
          // This is expected when the client is used for read-only
          // operations such as fetching data.
        }
      },
    },
  });
}
