import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { clearStoredReferrer, getStoredReferrer } from './referralService';

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
  const referredByUid = getStoredReferrer();

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
    ...(referredByUid && referredByUid !== credential.user.uid ? { referredByUid } : {}),
  });
  await sendEmailVerification(credential.user);
  clearStoredReferrer();
  await signOut(auth);

  return credential.user;
};

export const signIn = async (email: string, password: string): Promise<User> => {
  const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  await credential.user.reload();
  if (!credential.user.emailVerified) {
    try {
      await sendEmailVerification(credential.user);
    } finally {
      await signOut(auth);
    }
    throw Object.assign(new Error('Confirme seu e-mail antes de entrar.'), {
      code: 'auth/email-not-verified',
    });
  }
  clearStoredReferrer();
  return credential.user;
};

export const signInWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  const credential = await signInWithPopup(auth, provider);
  const profileRef = doc(db, 'users', credential.user.uid);
  const profile = await getDoc(profileRef);

  if (!profile.exists()) {
    const referredByUid = getStoredReferrer();
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
      ...(referredByUid && referredByUid !== credential.user.uid ? { referredByUid } : {}),
    });
  }

  clearStoredReferrer();

  return credential.user;
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email.trim().toLowerCase());
};

export const getNickname = async (user: User): Promise<string> => {
  const profile = await getDoc(doc(db, 'users', user.uid));
  const nickname = profile.data()?.nickname;
  return typeof nickname === 'string' && nickname.trim()
    ? nickname.trim()
    : user.displayName?.trim() || 'Minha conta';
};

export const updateNickname = async (user: User, nickname: string): Promise<string> => {
  const normalizedNickname = nickname.trim();
  if (normalizedNickname.length < 2 || normalizedNickname.length > 30) {
    throw new Error('O apelido deve ter entre 2 e 30 caracteres.');
  }

  await updateProfile(user, { displayName: normalizedNickname });
  await setDoc(doc(db, 'users', user.uid), {
    nickname: normalizedNickname,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  return normalizedNickname;
};

export const logOut = async (): Promise<void> => {
  await signOut(auth);
};
