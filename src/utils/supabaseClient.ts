// utils/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://mqzjaptjvjyvdfogmqmg.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xemphcHRqdmp5dmRmb2dtcW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NjI4NTEsImV4cCI6MjA2OTUzODg1MX0.yvT9BrZSGJk-sA7o-RRcf1Be_NIt7BAVLG7jPx9IyEw";

export const supabase = createClient(supabaseUrl, supabaseKey);
