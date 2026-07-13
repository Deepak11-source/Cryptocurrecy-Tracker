import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import useFetch from './useFetch';

vi.mock('axios');

afterEach(() => {
  vi.resetAllMocks();
});

describe('useFetch', () => {
  it('starts in a loading state with no data', () => {
    axios.get.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useFetch('https://example.com/data'));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('resolves to data on success', async () => {
    axios.get.mockResolvedValue({ data: { hello: 'world' } });
    const { result } = renderHook(() => useFetch('https://example.com/data'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ hello: 'world' });
    expect(result.current.error).toBe(null);
  });

  it('resolves to an error on failure', async () => {
    const err = new Error('network down');
    axios.get.mockRejectedValue(err);
    const { result } = renderHook(() => useFetch('https://example.com/data'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(err);
  });

  it('skips fetching when url is falsy', () => {
    const { result } = renderHook(() => useFetch(null));
    expect(axios.get).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe(null);
  });
});
