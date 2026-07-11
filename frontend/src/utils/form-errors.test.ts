import { act, renderHook } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';

import { applyServerFieldErrors } from '@/utils/form-errors';

interface DemoForm {
  email: string;
  password: string;
}

function useDemoForm() {
  const form = useForm<DemoForm>({ defaultValues: { email: '', password: '' } });
  // Reading `errors` during render subscribes the hook so error updates re-render.
  void form.formState.errors;
  return form;
}

describe('applyServerFieldErrors', () => {
  it('sets errors on the allowed fields returned by the server', () => {
    const { result } = renderHook(() => useDemoForm());

    act(() => {
      applyServerFieldErrors(result.current.setError, { email: 'Email already registered.' }, [
        'email',
        'password',
      ]);
    });

    expect(result.current.formState.errors.email?.message).toBe('Email already registered.');
    expect(result.current.formState.errors.email?.type).toBe('server');
  });

  it('ignores server fields that are not in the allowed list', () => {
    const { result } = renderHook(() => useDemoForm());

    act(() => {
      applyServerFieldErrors(
        result.current.setError,
        { unknownField: 'Some server error.' } as Record<string, string>,
        ['email', 'password'],
      );
    });

    expect(result.current.formState.errors.email).toBeUndefined();
    expect(result.current.formState.errors.password).toBeUndefined();
  });

  it('leaves allowed fields untouched when the server provides no message for them', () => {
    const { result } = renderHook(() => useDemoForm());

    act(() => {
      applyServerFieldErrors(result.current.setError, { email: 'Bad email.' }, [
        'email',
        'password',
      ]);
    });

    expect(result.current.formState.errors.password).toBeUndefined();
  });
});
