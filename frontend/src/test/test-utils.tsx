import { type RenderOptions, render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';

import { makeStore, type AppStore, type RootState } from '@/store';

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
}

/**
 * Renders a component within a fresh Redux store so tests stay isolated.
 * Returns the created `store` alongside the usual RTL result for assertions and
 * dispatching. Router context is added per-test where needed.
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState,
    store = makeStore(preloadedState),
    ...renderOptions
  }: RenderWithProvidersOptions = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <ReduxProvider store={store}>{children}</ReduxProvider>;
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

interface FetchLike {
  mock: { calls: unknown[][] };
}

/**
 * Reads the first request made through a mocked `fetch`, normalising the two
 * shapes RTK Query may use (a `Request` instance, or `(url, init)`) into a
 * simple `{ url, body }` for assertions.
 */
export async function readFetchRequest(
  fetchMock: FetchLike,
): Promise<{ url: string; body: unknown }> {
  const [arg, init] = fetchMock.mock.calls[0] as [Request | string, RequestInit | undefined];

  if (arg instanceof Request) {
    const text = await arg.clone().text();
    return { url: arg.url, body: text ? JSON.parse(text) : undefined };
  }

  const body = typeof init?.body === 'string' ? JSON.parse(init.body) : undefined;
  return { url: String(arg), body };
}
