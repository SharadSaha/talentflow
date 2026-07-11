import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { routes } from '@/routes/route-config';

const router = createBrowserRouter(routes);

/** Mounts the application router. Rendered within `AppProviders`. */
export function AppRouter() {
  return <RouterProvider router={router} />;
}
