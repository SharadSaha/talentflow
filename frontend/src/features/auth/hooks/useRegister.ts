import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { toast } from '@/components/ui/sonner';
import { getHomeRouteForRole } from '@/constants/routes';
import { useRegisterMutation } from '@/features/auth/api/authApi';
import type { RegisterFormValues } from '@/features/auth/schemas/auth.schemas';
import { setCredentials } from '@/reducers/authSlice';
import { tokenService } from '@/services/auth/token.service';
import { useAppDispatch } from '@/store/hooks';
import type { NormalizedApiError } from '@/types/api';
import { getApiErrorMessage, normalizeApiError } from '@/utils/api-error';
import { splitFullName } from '@/utils/format';

interface UseRegisterResult {
  register: (values: RegisterFormValues) => Promise<NormalizedApiError | null>;
  isLoading: boolean;
}

/**
 * Encapsulates candidate registration: splits the full name into the parts the
 * backend expects, creates the account, auto-signs the new candidate in with
 * the returned token, and redirects to their dashboard. Registration always
 * creates a Candidate — HR accounts are provisioned separately.
 */
export function useRegister(): UseRegisterResult {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [registerRequest, { isLoading }] = useRegisterMutation();

  const register = useCallback(
    async (values: RegisterFormValues): Promise<NormalizedApiError | null> => {
      const { firstName, lastName } = splitFullName(values.fullName);

      try {
        const { user, accessToken } = await registerRequest({
          email: values.email,
          password: values.password,
          firstName,
          lastName,
        }).unwrap();

        tokenService.set(accessToken, true);
        dispatch(setCredentials({ user, token: accessToken }));
        toast.success('Your account has been created.');
        navigate(getHomeRouteForRole(user.role), { replace: true });
        return null;
      } catch (error) {
        toast.error(getApiErrorMessage(error));
        return normalizeApiError(error);
      }
    },
    [dispatch, navigate, registerRequest],
  );

  return { register, isLoading };
}
