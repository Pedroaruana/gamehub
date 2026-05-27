const supabaseUrl = "https://azufrvextbcxwwvqwmiy.supabase.co";
const supabaseKey = "sb_publishable_K0zqD8_Hkw7XC8aXraktKg_z39LxOdG";

window.supabaseClient = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);

console.log("Supabase OK");