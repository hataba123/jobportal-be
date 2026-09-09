import { createHmac, timingSafeEqual } from 'crypto';

export type VnpayParams = Record<string, string>;

function encode(value: string): string {
  return encodeURIComponent(value).replace(/%20/g, '+');
}

export function buildVnpaySignData(params: VnpayParams): string {
  return Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== '')
    .sort()
    .map((key) => `${encode(key)}=${encode(params[key])}`)
    .join('&');
}

export function signVnpay(params: VnpayParams, secret: string): string {
  return createHmac('sha512', secret)
    .update(buildVnpaySignData(params), 'utf8')
    .digest('hex');
}

export function verifyVnpay(params: VnpayParams, secureHash: string, secret: string): boolean {
  if (!secureHash) return false;
  const expected = signVnpay(params, secret);
  if (expected.length !== secureHash.length) return false;
  return timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(secureHash, 'utf8'));
}

export function formatVnpayDate(date: Date): string {
  const local = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${local.getUTCFullYear()}${pad(local.getUTCMonth() + 1)}${pad(local.getUTCDate())}${pad(local.getUTCHours())}${pad(local.getUTCMinutes())}${pad(local.getUTCSeconds())}`;
}
