import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App.tsx';

const respondWith = (response: () => Promise<Response>) =>
  vi.stubGlobal('fetch', vi.fn(response));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('App', () => {
  it("affiche l'état ok quand l'API répond 200", async () => {
    respondWith(() => Promise.resolve(new Response('{}', { status: 200 })));
    render(<App />);
    expect(
      await screen.findByText(/API et base de données joignables/),
    ).toBeTruthy();
  });

  it('distingue une base injoignable (503)', async () => {
    respondWith(() => Promise.resolve(new Response('{}', { status: 503 })));
    render(<App />);
    expect(
      await screen.findByText(/la base de données ne répond pas/),
    ).toBeTruthy();
  });

  it("signale l'API injoignable quand la requête échoue", async () => {
    respondWith(() => Promise.reject(new TypeError('Failed to fetch')));
    render(<App />);
    expect(await screen.findByText('API injoignable.')).toBeTruthy();
  });
});
