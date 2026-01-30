// Fully hardcoded credentials and roles - no Supabase auth
const USERS: Record<string, { password: string; role: UserRole }> = {
  sarru: { password: 'sarru', role: 'admin' },
  hiba: { password: 'ammukutty', role: 'user' },
};

export type UserRole = 'admin' | 'user';

export interface AuthUser {
  username: string;
  role: UserRole;
}

const AUTH_KEY = 'our-little-infinity-auth';

export function login(username: string, password: string): AuthUser | null {
  const user = USERS[username as keyof typeof USERS];
  
  if (user && user.password === password) {
    const authUser: AuthUser = { username, role: user.role };
    localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
    return authUser;
  }
  
  return null;
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function getCurrentUser(): AuthUser | null {
  const stored = localStorage.getItem(AUTH_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as AuthUser;
    } catch {
      return null;
    }
  }
  return null;
}

export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === 'admin';
}
