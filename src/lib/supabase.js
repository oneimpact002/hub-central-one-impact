import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yrdxlixzawlmsqlgellt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZHhsaXh6YXdsbXNxbGdlbGx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MjU5NzMsImV4cCI6MjA5NjEwMTk3M30.JXSI4BT2D_0gwT6iBp5rdpZ1qeWj_cN1yCuRQ2w1eiw'

export const supabase = createClient(supabaseUrl, supabaseKey)