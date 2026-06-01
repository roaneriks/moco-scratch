import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://jxzincixksuwsnulspwc.supabase.co'

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4emluY2l4a3N1d3NudWxzcHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDYzMzEsImV4cCI6MjA5NTc4MjMzMX0.xxzxJgfGU7_PNN9N9pIFcLd6j9pQh5Hz9TXTWtWTTgk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
