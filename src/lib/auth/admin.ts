import { headers } from 'next/headers';
import { requireActiveAdmin } from './server-authorization';

export async function getAdminUser() {
  const result = await requireActiveAdmin({ headers: await headers() });
  return result.user || null;
}
