// utils/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://zzwlrwodwcijsendalzt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6d2xyd29kd2NpanNlbmRhbHp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4ODQ0NjEsImV4cCI6MjA2NTQ2MDQ2MX0.pqlhdqwO7bUPwMBmOasohTExZj6GnQbuoobYtds6qo0";

export const supabase = createClient(supabaseUrl, supabaseKey);
