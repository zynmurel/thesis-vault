// utils/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://opilxinivstvpkwdfnto.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9waWx4aW5pdnN0dnBrd2RmbnRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MjYxODcsImV4cCI6MjA5MzMwMjE4N30.ew-5E4bOlz3pftZ4gXr4hM6uVFCdACJ4wtFJImpnH-k";

export const supabase = createClient(supabaseUrl, supabaseKey);
