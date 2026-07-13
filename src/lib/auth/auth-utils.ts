import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  type User
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { createUser, getUserById } from '../data-connect';
import { ROLES } from './roles';

export const BANNED_ACCOUNT_MESSAGE = 'Your account is banned. Please contact support for assistance.';
export const BLOCKED_ACCOUNT_MESSAGE = 'Your account is not allowed to use the platform. Please contact support for assistance.';

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
        role
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
  } catch (error) {
    console.error("Error logging in:", error);
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
          role: userRole
        });
      } else {
        const accountStatus = userData.data.user.accountStatus || 'ACTIVE';
        if (accountStatus !== 'ACTIVE') {
          await firebaseSignOut(auth);
          throw new Error(accountStatus === 'BANNED' ? BANNED_ACCOUNT_MESSAGE : BLOCKED_ACCOUNT_MESSAGE);
        }
        userRole = user.email === 'markjandoc@gmail.com' ? ROLES.ADMIN : userData.data.user.role;
      }
    } catch (dbError: any) {
      if (dbError?.message?.includes('contact support')) {
        throw dbError;
      }
      console.warn("Failed to sync/fetch user from database, falling back to client role routing:", dbError);
    }
    
    return { user, role: userRole };
  } catch (error) {
    console.error("Error with Google Sign-In:", error);
    throw error;
  }
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
