import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oktvvsrxmyigurfiatrn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdHZ2c3J4bXlpZ3VyZmlhdHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzkxOTUsImV4cCI6MjA5OTYxNTE5NX0.IaNLyihUzJaSBANm8chmVYglt8U-aQEuAfntIUFVS8A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
