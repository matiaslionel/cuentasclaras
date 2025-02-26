import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zowdqjopetvogbdhecse.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpvd2Rxam9wZXR2b2diZGhlY3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1NzY3OTMsImV4cCI6MjA1NTE1Mjc5M30.we6cIY70F9GzKsx5YlY8GPSY-40QncmAo5oUcvjqnbw';//'58vnfDG5qxPLDG'

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient(supabaseUrl, supabaseKey); 