import React, { useCallback, useState, useEffect } from 'react';
import UserContext from './context';
import { signIn, getSession, signOut } from 'next-auth/react';
import { IUser } from '../../lib/models/User';
import { ROUTER } from '../../lib/utils';

export interface UserProviderProps {
  children: React.ReactNode;
}

function UserProvider({ children }: UserProviderProps): JSX.Element {
  const [user, setUser] = useState<IUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback((): void => {
    setUser(null);
    window.localStorage.removeItem(`user`);
    signOut({ callbackUrl: ROUTER.login });
  }, []);

  const signup = useCallback(async (payload: SignUpPayload) => {
    const res = await fetch(`/api/users`, {
      method: `POST`,
      headers: { 'Content-Type': `application/json` },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? `Registration failed`);
      return false;
    }
    setError(null);
    return true;
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string,
      redirect = true,
      callbackUrl = ROUTER.home,
    ): Promise<boolean> => {
      const signin = await signIn(`credentials`, {
        email,
        password,
        redirect,
        callbackUrl,
      });
      // With redirect: false, next-auth reports bad credentials in `error`, not `ok`.
      if (signin?.ok && !signin.error) {
        const session = await getSession();
        if (session?.user) setUser(session.user as unknown as IUser);
        return true;
      }
      return false;
    },
    [],
  );

  const loginDemo = useCallback(async () => {
    await signIn(`demo`, { callbackUrl: ROUTER.home });
  }, []);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await getSession();
        if (session?.user) {
          const res = await fetch(`/api/users/me`);
          if (res.ok) setUser(await res.json());
        }
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        error,
        loading,
        isAuthenticated: !!user,
        login,
        loginDemo,
        logout,
        signup,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export default UserProvider;
