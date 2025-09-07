// utils/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://wvidpdhwvpzhqnmevole.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2aWRwZGh3dnB6aHFubWV2b2xlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMTI0NDksImV4cCI6MjA3Mjc4ODQ0OX0.8pypeDSDnIx2fO-9199bTR_XAZ3Q5a3_5u_UHuvWC1I";

export const supabase = createClient(supabaseUrl, supabaseKey);
