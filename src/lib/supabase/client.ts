import { createBrowserClient } from '@supabase/ssr';
import { supabaseUrl, supabasePublishableKey } from './env';

/**
 * Creates a Supabase client for use in Browser / Client Components.
 *
 * The underlying `createBrowserClient` from @supabase/ssr already
 * implements a singleton pattern — calling this function multiple
 * times will return the same client instance.
 */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
