import { type ReactNode, useEffect } from 'react';

import { clearCredentials, setAuthStatus, setCredentials } from '@/reducers/authSlice';
import { useLazyGetMeQuery } from '@/features/auth/api/authApi';
import { tokenService } from '@/services/auth/token.service';
import { useAppDispatch } from '@/store/hooks';

interface AuthBootstrapProps {
  children: ReactNode;
}

/**
 * Restores the authenticated session on app load: if a persisted token exists,
 * it validates it via `/auth/me` and hydrates the auth slice; otherwise the
 * session is marked unauthenticated. Route guards wait on the resulting
 * bootstrap status so protected routes never flash a redirect during startup.
 */
export function AuthBootstrap({ children }: AuthBootstrapProps) {
  const dispatch = useAppDispatch();
  const [triggerGetMe] = useLazyGetMeQuery();

  useEffect(() => {
    const token = tokenService.get();

    if (!token) {
      dispatch(setAuthStatus('unauthenticated'));
      return;
    }

    dispatch(setAuthStatus('authenticating'));
    triggerGetMe(undefined, false)
      .unwrap()
      .then((user) => dispatch(setCredentials({ user, token })))
      .catch(() => dispatch(clearCredentials()));
  }, [dispatch, triggerGetMe]);

  return children;
}
