import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface SignUpData {
  name: string;
  phone: string;
  email: string;
  password: string;
}

const normalizePhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return null;
  return digits.startsWith('55') ? `+${digits}` : `+55${digits}`;
};

export const signUp = async ({ name, phone, email, password }: SignUpData): Promise<User> => {
  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);

  await updateProfile(credential.user, { displayName: normalizedName });
  await setDoc(doc(db, 'users', credential.user.uid), {
    name: normalizedName,
    email: normalizedEmail,
    phone: normalizePhone(phone),
    phoneVerified: false,
    plan: {
      code: 'free',
      status: 'active',
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    schemaVersion: 1,
  });

  return credential.user;
};

export const signIn = async (email: string, password: string): Promise<User> => {
  const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  return credential.user;
};

export const signInWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  const credential = await signInWithPopup(auth, provider);
  const profileRef = doc(db, 'users', credential.user.uid);
  const profile = await getDoc(profileRef);

  if (!profile.exists()) {
    await setDoc(profileRef, {
      name: credential.user.displayName?.trim() || 'Usuário',
      email: credential.user.email?.toLowerCase() || '',
      phone: credential.user.phoneNumber,
      phoneVerified: Boolean(credential.user.phoneNumber),
      plan: {
        code: 'free',
        status: 'active',
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      schemaVersion: 1,
    });
  }

  return credential.user;
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email.trim().toLowerCase());
};

export const logOut = async (): Promise<void> => {
  await signOut(auth);
};
