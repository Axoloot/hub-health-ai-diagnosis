import Head from 'next/head';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { ReactNode, useEffect } from 'react';

import '../../styles/card.css';
import '../../styles/layout.css';
import '../../styles/globals.css';
import UserProvider from '../providers/userProvider';
import { useUserContext } from '../providers/userProvider';
import { ROUTER } from '../lib/utils';

import { NavBar } from '../components';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PUBLIC_ROUTES = [ROUTER.login, ROUTER.register];

/** Sends visitors to the login page until the session check says they are signed in. */
function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { loading, isAuthenticated } = useUserContext();
  const isPublic = PUBLIC_ROUTES.includes(router.pathname);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated && !isPublic) router.replace(ROUTER.login);
    if (isAuthenticated && isPublic) router.replace(ROUTER.home);
  }, [loading, isAuthenticated, isPublic, router]);

  if (isPublic) return <>{children}</>;
  if (loading || !isAuthenticated) return null;
  return (
    <>
      <NavBar />
      {children}
    </>
  );
}

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta
          name="description"
          content="HUB-Health : plateforme de diagnostic assisté par IA pour les médecins (démo portfolio)."
        />
        <title>HUB-Health</title>
        <meta name="theme-color" content="#f2f2f2" />
      </Head>
      <UserProvider>
        <AuthGate>
          <Component {...pageProps} />
        </AuthGate>
      </UserProvider>
      <ToastContainer />
    </>
  );
}
