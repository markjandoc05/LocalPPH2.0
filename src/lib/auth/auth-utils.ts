import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { createUser, getUserById } from '../data-connect';
import { ROLES } from './roles';

export const registerUser = async (email: string, password: string, displayName: string, role: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update Firebase Auth profile
    await updateProfile(user, { displayName });
    
    // Sync to PostgreSQL via Data Connect
    await createUser({
      id: user.uid,
      email: user.email!,
      displayName,
      role
    });
    
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
        userRole = user.email === 'markjandoc@gmail.com' ? ROLES.ADMIN : userData.data.user.role;
      }
    } catch (dbError) {
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
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};
