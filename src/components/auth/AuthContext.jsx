import { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState(null);
  const [loading, setLoading] = useState(true);
  const url = import.meta.env.VITE_I18N_BASE;
  async function loadMe() {
    try {
      const res = await fetch(url + '/auth/me', { credentials: 'include' });
      if (!res.ok) throw new Error();
      const me = await res.json();
      let groups = [];
      try {
        const raw = localStorage.getItem(`user_groups:${me.sub}`);
        if (raw) groups = JSON.parse(raw);
      } catch {groups = [];}
      if (!groups || groups.length === 0) {
        throw new Error('groups missing');
      }
      setGroups(groups)
      setUser({ ...me, role: me.is_admin ? 'admin' : 'user' });
    } catch {
      setUser(null);
      setGroups(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadMe(); }, []);

  const login = async (username, password) => {
    let res;
    try {
      res = await fetch(url + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
    } catch (e) {
      const err = new Error(t('login.global_error'));
      err.status = 0;
      throw err;
    }

    const raw = await res.text();
    let data = {};
    try { data = raw ? JSON.parse(raw) : {}; } catch { }

    if (res.status === 403) {
      const msg = t('login.invalid_credentials') || data.detail || data.error || 'Identifiants invalides';
      const err = new Error(msg);
      err.status = 403;
      throw err;
    }

    if (res.status === 429) {
      const msg = t('login.too_many_attempts') || 'Trop de tentatives. Réessayez plus tard.';
      const err = new Error(msg);
      err.status = 429;
      throw err;
    }

    if (!res.ok) {
      const err = new Error(t('login.global_error'));
      err.status = res.status;
      throw err;
    }

    const u = {
      sub: data.user,
      email: data.email,
      name: data.username || data.givenName,
      is_admin: !!data.is_admin
    };
    localStorage.setItem(`user_groups:${data.user}`, JSON.stringify(data.groups || []));
    setGroups(data.groups || [])
    setUser({ ...u, role: u.is_admin ? 'admin' : 'user' });
    return u;
  };


  const logout = async () => {
    await fetch(url + '/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    setGroups(null);
  };

  return (
    <AuthContext.Provider value={{ user, groups, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
