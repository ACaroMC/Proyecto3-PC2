import { expect, test } from 'vitest';
import { GET } from './route';

test('el endpoint de salud devuelve el estado esperado sin caché', async () => {
  const response = GET();

  expect(response.status).toBe(200);
  expect(response.headers.get('Cache-Control')).toBe('no-store');
  await expect(response.json()).resolves.toEqual({ status: 'ok' });
});
