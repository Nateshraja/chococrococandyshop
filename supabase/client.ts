import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lskqjrkebtpddumvyfqb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxza3FqcmtlYnRwZGR1bXZ5ZnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3Mjg1MTcsImV4cCI6MjA2ODMwNDUxN30.u01tGYGdIULZltC_QWMfKJWD7VuuS2mSR48EgUxRtVM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);