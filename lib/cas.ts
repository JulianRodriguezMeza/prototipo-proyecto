import * as Linking from 'expo-linking';

export type CasValidatedUser = {
  username: string;
  displayName?: string;
};

export const CAS_BASE_URL = 'https://enew.corposucre.edu.co/cas';

function getParam(url: string, key: string) {
  try {
    const u = new URL(url);
    return u.searchParams.get(key);
  } catch {
    return null;
  }
}

export function createCasServiceUrl() {
  return Linking.createURL('/auth/callback');
}

export function createCasLoginUrl() {
  const service = encodeURIComponent(createCasServiceUrl());
  return `${CAS_BASE_URL}/login?service=${service}`;
}

export function extractTicket(redirectedUrl: string): string | null {
  return getParam(redirectedUrl, 'ticket');
}

function parseTag(xml: string, tag: string): string | undefined {
  const r = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = xml.match(r);
  return match?.[1]?.trim() || undefined;
}

export async function validateTicket(ticket: string): Promise<CasValidatedUser> {
  const service = encodeURIComponent(createCasServiceUrl());
  const url = `${CAS_BASE_URL}/serviceValidate?service=${service}&ticket=${encodeURIComponent(ticket)}`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error('CAS validation failed');

  const xml = await res.text();
  const user = parseTag(xml, 'cas:user') ?? parseTag(xml, 'user');
  if (!user) throw new Error('CAS user not found');

  const displayName =
    parseTag(xml, 'cas:displayName') ??
    parseTag(xml, 'displayName') ??
    parseTag(xml, 'cas:cn') ??
    parseTag(xml, 'cn');

  return { username: user, displayName };
}

