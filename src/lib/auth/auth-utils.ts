import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail,
  linkWithPopup,
  unlink,
  updatePassword,
  updateProfile,
  type User
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { createUser, getUserById, updateUser } from '../data-connect';
import { ROLES } from './roles';

export const BANNED_ACCOUNT_MESSAGE = 'Your account is banned. Please contact support for assistance.';
export const BLOCKED_ACCOUNT_MESSAGE = 'Your account is not allowed to use the platform. Please contact support for assistance.';
export const GOOGLE_LOGIN_PASSWORD_ACCOUNT_MESSAGE =
  'This email already has an account. Please log in with your password first, then connect Google in Account Security.';
export const EMAIL_LOGIN_GOOGLE_ACCOUNT_MESSAGE =
  'This email is registered with Google. Please log in using Google instead of a password.';
export const GOOGLE_LINK_EMAIL_MISMATCH_MESSAGE =
  'Please choose the same Google email address as your current LocalPages account.';

const getEmailActionSettings = () => {
  if (typeof window === 'undefined') return undefined;

  return {
    url: `${window.location.origin}/profile`,
    handleCodeInApp: false,
  };
};

export const getAuthEmailErrorMessage = (error: any, fallback: string) => {
  switch (error?.code) {
    case 'auth/missing-email':
    case 'auth/invalid-email':
      return 'Please make sure your account has a valid email address.';
    case 'auth/user-not-found':
      return 'No account was found for this email address.';
    case 'auth/too-many-requests':
      return 'Too many email requests were made. Please wait a few minutes and try again.';
    case 'auth/network-request-failed':
      return 'Network error while sending the email. Please check your connection and try again.';
    case 'auth/unauthorized-continue-uri':
    case 'auth/invalid-continue-uri':
      return 'The email action link is not authorized in Firebase. Please check the Firebase Authentication authorized domains.';
    default:
      return error?.message || fallback;
  }
};

export const registerUser = async (email: string, password: string, displayName: string, role: string) => {
  try {
    let userCredential;

    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      if (error?.code !== 'auth/email-already-in-use') {
        throw error;
      }

      userCredential = await signInWithEmailAndPassword(auth, email, password);
    }

    const user = userCredential.user;
    
    // Update Firebase Auth profile
    await updateProfile(user, { displayName });
    
    // Sync to PostgreSQL via Data Connect
    const existingProfile = await getUserById({ id: user.uid });
    if (!existingProfile?.data?.user) {
      await createUser({
        id: user.uid,
        email: user.email!,
        displayName,
        role,
        emailVerified: user.emailVerified,
      });
    } else if (existingProfile.data.user.emailVerified !== user.emailVerified) {
      await updateUser({
        id: user.uid,
        data: { emailVerified: user.emailVerified },
      });
    }
    
    return { user, role };
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const normalizedEmail = email.trim();
    if (normalizedEmail) {
      const signInMethods = await fetchSignInMethodsForEmail(auth, normalizedEmail);
      if (
        signInMethods.includes(GoogleAuthProvider.PROVIDER_ID) &&
        !signInMethods.includes('password')
      ) {
        const error = new Error(EMAIL_LOGIN_GOOGLE_ACCOUNT_MESSAGE) as Error & { code?: string };
        error.code = 'auth/email-login-google-account';
        throw error;
      }
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Fetch role from Data Connect
    const userData = await getUserById({ id: user.uid });
    const accountStatus = userData?.data?.user?.accountStatus || 'ACTIVE';

    if (accountStatus !== 'ACTIVE') {
      await firebaseSignOut(auth);
      throw new Error(accountStatus === 'BANNED' ? BANNED_ACCOUNT_MESSAGE : BLOCKED_ACCOUNT_MESSAGE);
    }
    
    // Mocking response for now if null
    const role = userData?.data?.user?.role || ROLES.SUBSCRIBER;
    
    return { user, role };
  } catch (error: any) {
    const expectedAuthErrors = new Set([
      'auth/invalid-credential',
      'auth/user-not-found',
      'auth/wrong-password',
      'auth/invalid-email',
      'auth/too-many-requests',
      'auth/email-login-google-account',
    ]);

    if (!expectedAuthErrors.has(error?.code)) {
      console.warn("Unexpected login error:", error);
    }
    throw error;
  }
};

export const loginWithGoogle = async (role: string = ROLES.SUBSCRIBER) => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    
    let userRole = role;
    if (user.email === 'markjandoc@gmail.com') {
      userRole = ROLES.ADMIN;
    }
    
    try {
      // Check if user exists in DB
      const userData = await getUserById({ id: user.uid });
      
      if (!userData?.data?.user) {
        // New user, sync to DB
        await createUser({
          id: user.uid,
          email: user.email!,
          displayName: user.displayName || 'Unknown',
          photoUrl: user.photoURL || undefined,
          role: userRole,
          emailVerified: true,
        });
      } else {
        const accountStatus = userData.data.user.accountStatus || 'ACTIVE';
        if (accountStatus !== 'ACTIVE') {
          await firebaseSignOut(auth);
          throw new Error(accountStatus === 'BANNED' ? BANNED_ACCOUNT_MESSAGE : BLOCKED_ACCOUNT_MESSAGE);
        }
        userRole = user.email === 'markjandoc@gmail.com' ? ROLES.ADMIN : userData.data.user.role;
        if (!userData.data.user.emailVerified) {
          await updateUser({
            id: user.uid,
            data: { emailVerified: true },
          });
        }
      }
    } catch (dbError: any) {
      if (dbError?.message?.includes('contact support')) {
        throw dbError;
      }
      console.warn("Failed to sync/fetch user from database, falling back to client role routing:", dbError);
    }
    
    return { user, role: userRole };
  } catch (error: any) {
    const expectedAuthErrors = new Set([
      'auth/account-exists-with-different-credential',
      'auth/popup-closed-by-user',
      'auth/popup-blocked',
      'auth/cancelled-popup-request',
      'auth/operation-not-allowed',
      'auth/unauthorized-domain',
      'auth/web-storage-unsupported',
    ]);

    if (error?.code === 'auth/account-exists-with-different-credential') {
      error.message = GOOGLE_LOGIN_PASSWORD_ACCOUNT_MESSAGE;
    } else if (!expectedAuthErrors.has(error?.code)) {
      console.warn("Unexpected Google Sign-In error:", error);
    }
    throw error;
  }
};

export const connectGoogleLogin = async () => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('You must be signed in before connecting Google login.');
  }

  const providerIds = new Set(currentUser.providerData.map((providerInfo) => providerInfo.providerId));
  if (providerIds.has(GoogleAuthProvider.PROVIDER_ID)) return { alreadyGoogle: true };

  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const credential = await linkWithPopup(currentUser, provider);
    const linkedUser = credential.user;
    const googleProfile = linkedUser.providerData.find(
      (providerInfo) => providerInfo.providerId === GoogleAuthProvider.PROVIDER_ID
    );
    const googleEmail = googleProfile?.email?.toLowerCase();
    const accountEmail = linkedUser.email?.toLowerCase();

    if (googleEmail && accountEmail && googleEmail !== accountEmail) {
      await unlink(linkedUser, GoogleAuthProvider.PROVIDER_ID);
      const error = new Error(GOOGLE_LINK_EMAIL_MISMATCH_MESSAGE) as Error & { code?: string };
      error.code = 'auth/google-link-email-mismatch';
      throw error;
    }

    await linkedUser.reload();

    await updateUser({
      id: linkedUser.uid,
      data: {
        emailVerified: true,
        photoUrl: linkedUser.photoURL || undefined,
      },
    });

    return { alreadyGoogle: false };
  } catch (error: any) {
    const expectedAuthErrors = new Set([
      'auth/google-link-email-mismatch',
      'auth/popup-closed-by-user',
      'auth/popup-blocked',
      'auth/cancelled-popup-request',
      'auth/credential-already-in-use',
      'auth/provider-already-linked',
      'auth/requires-recent-login',
      'auth/unauthorized-domain',
      'auth/web-storage-unsupported',
    ]);

    if (!expectedAuthErrors.has(error?.code)) {
      console.warn("Unexpected Google link error:", error);
    }
    throw error;
  }
};

export const disconnectGoogleLogin = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('You must be signed in before disconnecting Google login.');
  }

  const providerIds = new Set(currentUser.providerData.map((providerInfo) => providerInfo.providerId));
  if (!providerIds.has(GoogleAuthProvider.PROVIDER_ID)) {
    return { alreadyDisconnected: true };
  }

  if (!providerIds.has('password')) {
    throw new Error('Set a password before disconnecting Google login.');
  }

  await unlink(currentUser, GoogleAuthProvider.PROVIDER_ID);
  await currentUser.reload();
  return { alreadyDisconnected: false };
};

export const setPasswordLogin = async (password: string) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('You must be signed in before setting a password.');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const providerIds = new Set(currentUser.providerData.map((providerInfo) => providerInfo.providerId));
  if (providerIds.has('password')) return { alreadyPassword: true };

  await updatePassword(currentUser, password);
  await currentUser.reload();
  return { alreadyPassword: false };
};

export const logoutUser = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      throw new Error('A registered email address is required before sending a password reset link.');
    }
    await sendPasswordResetEmail(auth, normalizedEmail, getEmailActionSettings());
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

export const sendVerificationEmail = async (targetUser: User | null = auth.currentUser) => {
  try {
    if (!targetUser) {
      throw new Error('You must be signed in before sending an email verification link.');
    }

    await targetUser.reload();
    if (targetUser.emailVerified) {
      return { alreadyVerified: true };
    }

    await sendEmailVerification(targetUser, getEmailActionSettings());
    return { alreadyVerified: false };
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};
