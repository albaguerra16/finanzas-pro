import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qwxhblvmwvyzgzupeqow.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3eGhibHZtd3Z5emd6dXBlcW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNDEzOTQsImV4cCI6MjA4OTgxNzM5NH0.8i7MbGSvCzr8-qStubiMh6mioia0c9mN5zqDKGxSTeQ'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
