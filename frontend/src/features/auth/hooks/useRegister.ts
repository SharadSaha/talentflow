import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { toast } from '@/components/ui/sonner';
import { USER_ROLE } from '@/constants/roles';
import { getHomeRouteForRole } from '@/constants/routes';
import { useRegisterMutation } from '@/features/auth/api/authApi';
import type { RegisterFormValues } from '@/features/auth/schemas/auth.schemas';
import type { RegisterRequest } from '@/features/auth/types/auth.types';
import { setCredentials } from '@/reducers/authSlice';
import { tokenService } from '@/services/auth/token.service';
import { useAppDispatch } from '@/store/hooks';
import type { UserRole } from '@/constants/roles';
import type { NormalizedApiError } from '@/types/api';
import { getApiErrorMessage, normalizeApiError } from '@/utils/api-error';
import { splitFullName } from '@/utils/format';

/**
 * Registration input: the shared candidate fields plus optional employer
 * context. Candidates omit `role`/`organizationName`; HR sign-up supplies both.
 */
export interface RegisterInput extends RegisterFormValues {
  role?: UserRole;
  organizationName?: string;
}

interface UseRegisterResult {
  register: (input: RegisterInput) => Promise<NormalizedApiError | null>;
  isLoading: boolean;
}

/**
 * Encapsulates self-service registration for both candidates and employers:
 * splits the full name into the parts the backend expects, creates the account
 * (sending `role: HR` + `organizationName` for employers, the plain candidate
 * shape otherwise), auto-signs the new user in with the returned token, and
 * redirects to the dashboard for their role.
 */
export function useRegister(): UseRegisterResult {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [registerRequest, { isLoading }] = useRegisterMutation();

  const register = useCallback(
    async (input: RegisterInput): Promise<NormalizedApiError | null> => {
      const { firstName, lastName } = splitFullName(input.fullName);

      const body: RegisterRequest = {
        email: input.email,
        password: input.password,
        firstName,
        lastName,
      };

      if (input.role === USER_ROLE.HR) {
        body.role = USER_ROLE.HR;
        body.organizationName = input.organizationName;
      }

      try {
        const { user, accessToken } = await registerRequest(body).unwrap();

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
