import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { toast } from '@/components/ui/sonner';
import { getHomeRouteForRole } from '@/constants/routes';
import { useLoginMutation } from '@/features/auth/api/authApi';
import type { LoginFormValues } from '@/features/auth/schemas/auth.schemas';
import { setCredentials } from '@/reducers/authSlice';
import { tokenService } from '@/services/auth/token.service';
import { useAppDispatch } from '@/store/hooks';
import type { NormalizedApiError } from '@/types/api';
import { getApiErrorMessage, normalizeApiError } from '@/utils/api-error';

interface LocationState {
  from?: { pathname?: string };
}

/** Resolves the post-login destination, honouring a safe "return to" path. */
function resolveRedirect(fromPath: string | undefined, homeRoute: string): string {
  if (!fromPath) return homeRoute;
  // Only honour a return path within the user's own role namespace.
  const roleRoot = homeRoute.split('/').slice(0, 2).join('/');
  return fromPath.startsWith(roleRoot) ? fromPath : homeRoute;
}

interface UseLoginResult {
  login: (values: LoginFormValues) => Promise<NormalizedApiError | null>;
  isLoading: boolean;
}

/**
 * Encapsulates the login workflow: calls the API, persists the token per the
 * "remember me" choice, stores credentials, notifies the user, and redirects to
 * their role home (or the originally requested page). Returns a normalised error
 * on failure so the form can surface field-level messages.
 */
export function useLogin(): UseLoginResult {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginRequest, { isLoading }] = useLoginMutation();

  const login = useCallback(
    async (values: LoginFormValues): Promise<NormalizedApiError | null> => {
      try {
        const { user, accessToken } = await loginRequest({
          email: values.email,
          password: values.password,
        }).unwrap();

        tokenService.set(accessToken, values.rememberMe);
        dispatch(setCredentials({ user, token: accessToken }));
        toast.success(`Welcome back, ${user.firstName}.`);

        const fromPath = (location.state as LocationState | null)?.from?.pathname;
        navigate(resolveRedirect(fromPath, getHomeRouteForRole(user.role)), { replace: true });
        return null;
      } catch (error) {
        toast.error(getApiErrorMessage(error));
        return normalizeApiError(error);
      }
    },
    [dispatch, navigate, location.state, loginRequest],
  );

  return { login, isLoading };
}
