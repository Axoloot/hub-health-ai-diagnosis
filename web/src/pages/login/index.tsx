import { useState } from 'react';
import Link from 'next/link';
import { Text } from '@nextui-org/react';
import { toast } from 'react-toastify';
import { useUserContext } from '../../providers/userProvider';
import { Input, Button } from '../../components';
import { ROUTER } from '../../lib/utils';

const DEMO_ENABLED = process.env.NEXT_PUBLIC_DEMO_MODE !== `false`;
const REGISTRATION_ENABLED =
  process.env.NEXT_PUBLIC_ALLOW_REGISTRATION === `true`;

const Login = () => {
  const [email, setEmail] = useState(``);
  const [password, setPassword] = useState(``);
  const [loading, setLoading] = useState(false);
  const { login, loginDemo } = useUserContext();

  const submitForm = async () => {
    if (!email) return toast.error(`L'email est obligatoire`);
    if (!password) return toast.error(`Le mot de passe est obligatoire`);
    setLoading(true);
    const ok = await login(email, password, false);
    setLoading(false);
    if (ok) window.location.assign(ROUTER.home);
    else toast.error(`Email ou mot de passe incorrect`);
  };

  const startDemo = async () => {
    setLoading(true);
    await loginDemo(); // redirects on success
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-gray-bg1">
      <div className="w-full max-w-md m-auto bg-white rounded-lg border border-primaryBorder shadow-default py-10 px-16">
        <h1 className="text-2xl font-medium text-primary mt-4 mb-4 text-center">
          HUB-Health 🩺
        </h1>
        <p className="text-sm text-gray-600 text-center mb-8">
          Plateforme de diagnostic assisté par IA. Projet de démonstration : les
          patients sont fictifs et les modèles ne sont pas des dispositifs
          médicaux.
        </p>
        {DEMO_ENABLED && (
          <div className="flex flex-col items-center mb-6">
            <Button
              label={loading ? `Connexion…` : `Essayer la démo →`}
              onClick={() => !loading && startDemo()}
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Connexion en un clic en tant que médecin de démonstration. Les
              données sont réinitialisées chaque jour.
            </p>
            <div className="w-full flex items-center my-4 text-gray-400 text-xs">
              <div className="flex-grow border-t" />
              <span className="px-2">ou</span>
              <div className="flex-grow border-t" />
            </div>
          </div>
        )}
        <div className="flex flex-col justify-center items-center">
          <Input
            placeholder="Email"
            onChange={setEmail}
            value={email}
            type="email"
            required
          />
          <Input
            placeholder="Mot de passe"
            onChange={setPassword}
            value={password}
            type="password"
            required
          />
          <div className="p-4">
            <Button
              label="Connexion"
              onClick={() => !loading && submitForm()}
            />
          </div>
          {REGISTRATION_ENABLED && (
            <Text className="text-center">
              Vous n&apos;avez pas de compte ?
              <Link href={ROUTER.register}> Créer un compte</Link>
            </Text>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
