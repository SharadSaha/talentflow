import { Router } from 'express';

import { authenticate } from '@/auth/authenticate.middleware';
import { AUTH_ROUTES } from '@/constants/routes';
import { authRateLimiter } from '@/middlewares/rate-limiter';
import { validate } from '@/middlewares/validate';

import { getCurrentUser, login, register } from './auth.controller';
import { loginSchema, registerSchema } from './auth.schemas';

/**
 * Authentication routes, mounted under `/api/v1/auth`.
 *
 *   POST /register — create a candidate account (public)
 *   POST /login    — authenticate and receive an access token (public)
 *   GET  /me       — fetch the authenticated user (requires a valid token)
 */
const router = Router();

router.post(AUTH_ROUTES.REGISTER, authRateLimiter, validate(registerSchema), register);
router.post(AUTH_ROUTES.LOGIN, authRateLimiter, validate(loginSchema), login);
router.get(AUTH_ROUTES.ME, authenticate, getCurrentUser);

export { router as authRouter };
