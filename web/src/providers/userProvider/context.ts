import { IUser } from '../../lib/models/User';
import createCtx from '../createCtx';

declare global {
  interface SignUpPayload {
    email: string;
    password: string;
    pseudo: string;
  }

  type UserCtxValue = {
    user: IUser | null;
    error: string | null;
    /** True until the initial session check has finished. */
    loading: boolean;
    isAuthenticated: boolean;
    login: (
      email: string,
      password: string,
      redirect?: boolean,
      callback?: string,
    ) => Promise<boolean>;
    loginDemo: () => Promise<void>;
    signup: (payload: SignUpPayload) => Promise<boolean>;
    logout: () => void;
  };
}

const { ctx: UserContext, useCtx: useUserContext } = createCtx<UserCtxValue>();

export { useUserContext };
export default UserContext;
