const supabaseUrl = "https://azufrvextbcxwwvqwmiy.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6dWZydmV4dGJjeHd3dnF3bWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MzA0NzQsImV4cCI6MjA5NTIwNjQ3NH0.Z2S163L62pZA_NdPMqZibD7CrRfUXZTfGsnvktn9G2A";

window.supabaseClient = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);

console.log("Supabase OK");