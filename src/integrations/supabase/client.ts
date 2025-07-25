// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://lskqjrkebtpddumvyfqb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxza3FqcmtlYnRwZGR1bXZ5ZnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3Mjg1MTcsImV4cCI6MjA2ODMwNDUxN30.u01tGYGdIULZltC_QWMfKJWD7VuuS2mSR48EgUxRtVM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});