import { timingSafeEqual } from 'node:crypto';

export function isAuthorized(request) {
  const expected = process.env.BELLATECH_TEST_TOKEN || '';
  const header = request.headers.authorization || '';
  const token = /^Bearer (.+)$/i.exec(header)?.[1] || '';
  if (expected.length < 32 || !token) return false;
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(token, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

export function preparePrivateResponse(response, methods) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Robots-Tag', 'noindex');
  response.setHeader('Allow', methods);
}
