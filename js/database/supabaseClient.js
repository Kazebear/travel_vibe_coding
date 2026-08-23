import { setCurrentUser } from '../state.js';

const SUPABASE_URL = 'https://sghzjlrpdgyrmfeejsgc.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_m2u0xM1914_7VSOmtPlDHw_kb4JHSgy';

export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

function toPublicUser(profile, authUser) {
  if (!profile) return null;
  return {
    id: profile.id,
    username: profile.username,
    email: authUser?.email || '',
    role: profile.role,
    full_name: profile.full_name,
    phone: profile.phone,
    country: profile.country,
    address: profile.address,
    avatar: profile.avatar,
    created_at: profile.created_at,
  };
}

export async function loadProfile(authUser) {
  if (!authUser) {
    setCurrentUser(null);
    return null;
  }
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
  const publicUser = toPublicUser(profile, authUser);
  setCurrentUser(publicUser);
  return publicUser;
}

export async function initAuth() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  await loadProfile(session?.user || null);

  supabase.auth.onAuthStateChange((_event, session) => {
    loadProfile(session?.user || null);
  });
}
