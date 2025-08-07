import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ieiuhojoaoawofyzgxiz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllaXVob2pvYW9hd29meXpneGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1ODk0NzIsImV4cCI6MjA3MDE2NTQ3Mn0.cTfZzgNhauoQyvV_gRCf6LcXE0eQX_FttaXEkZurZ7o'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)