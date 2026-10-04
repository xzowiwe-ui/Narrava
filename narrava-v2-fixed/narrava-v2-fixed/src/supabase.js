// Supabase — opsional, hanya aktif jika user mengisi credentials di Settings
import { createClient } from '@supabase/supabase-js';

const url  = localStorage.getItem('nrv2_sb_url')  || import.meta.env.VITE_SUPABASE_URL  || '';
const anon = localStorage.getItem('nrv2_sb_anon') || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (url && anon && !url.includes('GANTI'))
  ? createClient(url, anon)
  : null;

export function isSupabaseEnabled() {
  return !!supabase;
}
