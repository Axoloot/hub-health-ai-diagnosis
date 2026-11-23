import Link from 'next/link';
import { ROUTER } from '@/lib/utils';
import { useUserContext } from '@/providers/userProvider';

const DEMO_ENABLED = process.env.NEXT_PUBLIC_DEMO_MODE !== `false`;

export const NavBar = () => {
  const { user, logout } = useUserContext();

  return (
    <nav className="bg-white px-4 py-2.5 fixed w-full z-20 top-0 left-0 border-b border-gray-200">
      <div className="container flex flex-wrap items-center justify-between mx-auto gap-2">
        <ul className="flex flex-row space-x-6 text-sm font-medium">
          <li>
            <Link href={ROUTER.home} className="text-blue-700">
              HUB-Health
            </Link>
          </li>
          <li>
            <Link
              href={ROUTER.listCustomers}
              className="text-gray-700 hover:text-blue-700"
            >
              Mes patients
            </Link>
          </li>
        </ul>
        <div className="flex items-center gap-3 text-sm">
          {DEMO_ENABLED && (
            <span className="rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs">
              Démo · données fictives
            </span>
          )}
          <span className="text-gray-600 hidden sm:inline">{user?.pseudo}</span>
          <button
            type="button"
            onClick={logout}
            className="text-white bg-blue-700 hover:bg-blue-800 rounded-lg px-4 py-2"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  );
};
