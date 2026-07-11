import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { toast } from '@/components/ui/sonner';
import { getLoginRouteForRole } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { clearCredentials } from '@/reducers/authSlice';
import { baseApi } from '@/services/api/baseApi';
import { tokenService } from '@/services/auth/token.service';
import { useAppDispatch } from '@/store/hooks';

/**
 * Returns a logout handler that clears the persisted token and session state,
 * purges the RTK Query cache so no other user's data lingers, notifies the
 * user, and returns them to the login screen for the role they were using.
 */
export function useLogout(): () => void {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { role } = useAuth();

  return useCallback(() => {
    const loginRoute = getLoginRouteForRole(role);
    tokenService.clear();
    dispatch(clearCredentials());
    dispatch(baseApi.util.resetApiState());
    toast.success('You have been signed out.');
    navigate(loginRoute, { replace: true });
  }, [dispatch, navigate, role]);
}
