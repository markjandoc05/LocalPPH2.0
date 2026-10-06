import { revalidatePath } from 'next/cache';

// Main reads listing data directly; expire its public page entries after a decision.
export const expirePublicBusinessCache = () => {
  revalidatePath('/');
  revalidatePath('/search');
  revalidatePath('/business/[slug]', 'page');
};

export const invalidatePublicBusinessCache = expirePublicBusinessCache;
