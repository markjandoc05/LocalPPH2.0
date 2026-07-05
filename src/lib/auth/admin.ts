import { headers } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getAdminUser() {
  const authHeader = (await headers()).get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const [user] = await db.select().from(users).where(eq(users.id, decodedToken.uid));
    
    if (user && user.role === 'ADMIN') {
        return user;
    }
    return null;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}
