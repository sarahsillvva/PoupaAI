import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { Expense, Category } from '../types';

export type NewExpenseData = Omit<Expense, 'id'>;

const STORAGE_KEY = 'poupa-ai-financials';
const CATEGORY_TARGETS_KEY = 'poupa-ai-category-targets';
const INSTALLATION_ID_KEY = 'poupa-ai-installation-id';
const LOCAL_DATA_OWNER_KEY = 'poupa-ai-local-data-owner';

type StoredData = { totalAmount: number; expenses: Expense[] };
export type CategoryTargets = Partial<Record<Category, { target: number }>>;

const emptyData = (): StoredData => ({ totalAmount: 0, expenses: [] });

const getStoredData = (): StoredData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const initialData = emptyData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<StoredData>;
    return {
      totalAmount: typeof parsed.totalAmount === 'number' ? parsed.totalAmount : 0,
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
    };
  } catch {
    throw new Error('Os dados salvos neste navegador estão corrompidos. A migração foi interrompida para evitar perdas.');
  }
};

const setStoredData = (data: StoredData) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

const getStoredCategoryTargets = (): CategoryTargets => {
  const stored = localStorage.getItem(CATEGORY_TARGETS_KEY);
  if (!stored) return {};
  try {
    return JSON.parse(stored) as CategoryTargets;
  } catch {
    throw new Error('As metas salvas neste navegador estão corrompidas. A migração foi interrompida para evitar perdas.');
  }
};

const removeUndefined = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const generateId = (suffix = '') => `${Date.now()}${suffix}-${Math.random().toString(36).slice(2, 11)}`;

const getInstallationId = () => {
  const existing = localStorage.getItem(INSTALLATION_ID_KEY);
  if (existing) return existing;
  const installationId = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : generateId();
  localStorage.setItem(INSTALLATION_ID_KEY, installationId);
  return installationId;
};

const createExpenses = (expenseData: NewExpenseData, preferredGroupId?: string): Expense[] => {
  const totalInstallments = expenseData.installments?.total ?? 1;
  if (totalInstallments <= 1) {
    return [{ ...expenseData, id: generateId(), installments: undefined, groupId: undefined }];
  }

  const groupId = preferredGroupId || generateId('-group');
  const originalDate = new Date(expenseData.dueDate);
  return Array.from({ length: totalInstallments }, (_, index) => {
    const installmentDate = new Date(
      originalDate.getUTCFullYear(),
      originalDate.getUTCMonth() + index,
      originalDate.getUTCDate(),
    );
    if (installmentDate.getUTCDate() !== originalDate.getUTCDate()) installmentDate.setDate(0);
    return {
      ...expenseData,
      id: generateId(`-${index + 1}`),
      groupId,
      dueDate: installmentDate.toISOString().split('T')[0],
      installments: { current: index + 1, total: totalInstallments },
      recurrence: undefined,
    };
  });
};

const userExpenses = (uid: string) => collection(db, 'users', uid, 'expenses');
const financialSettings = (uid: string) => doc(db, 'users', uid, 'financialSettings', 'current');

const getCloudExpenses = async (uid: string): Promise<Expense[]> => {
  const snapshot = await getDocs(userExpenses(uid));
  return snapshot.docs.map(expenseDoc => ({
    ...(expenseDoc.data() as Omit<Expense, 'id'>),
    id: expenseDoc.id,
  }));
};

export interface MigrationResult {
  migrated: boolean;
  expenseCount: number;
  settingsConflict: boolean;
}

export const migrateLocalDataToUser = async (uid: string): Promise<MigrationResult> => {
  const claimedBy = localStorage.getItem(LOCAL_DATA_OWNER_KEY);
  if (claimedBy && claimedBy !== uid) {
    // Never copy one person's legacy cache into a second account on a shared device.
    return { migrated: false, expenseCount: 0, settingsConflict: false };
  }

  const installationId = getInstallationId();
  const migrationRef = doc(db, 'users', uid, 'migrations', `local-storage-v1-${installationId}`);
  const existingMigration = await getDoc(migrationRef);

  if (existingMigration.data()?.status === 'completed') {
    localStorage.setItem(LOCAL_DATA_OWNER_KEY, uid);
    return {
      migrated: false,
      expenseCount: Number(existingMigration.data()?.expenseCount ?? 0),
      settingsConflict: Boolean(existingMigration.data()?.settingsConflict),
    };
  }

  const localFinancials = getStoredData();
  const localTargets = getStoredCategoryTargets();
  const cloudSettingsRef = financialSettings(uid);
  const cloudSettings = await getDoc(cloudSettingsRef);
  const hasLocalSettings = localFinancials.totalAmount !== 0 || Object.keys(localTargets).length > 0;
  const settingsConflict = cloudSettings.exists() && hasLocalSettings;

  // IDs are preserved and writes are repeatable. An interrupted migration can
  // safely run again without duplicating the user's expenses.
  for (let start = 0; start < localFinancials.expenses.length; start += 400) {
    const batch = writeBatch(db);
    localFinancials.expenses.slice(start, start + 400).forEach(expense => {
      batch.set(doc(db, 'users', uid, 'expenses', expense.id), {
        ...removeUndefined(expense),
        migratedFrom: 'local-storage-v1',
        updatedAt: serverTimestamp(),
      }, { merge: true });
    });
    await batch.commit();
  }

  if (!cloudSettings.exists()) {
    await setDoc(cloudSettingsRef, {
      totalAmount: localFinancials.totalAmount,
      categoryTargets: localTargets,
      updatedAt: serverTimestamp(),
      schemaVersion: 1,
    });
  }

  await setDoc(migrationRef, {
    status: 'completed',
    source: 'localStorage',
    sourceInstallationId: installationId,
    expenseCount: localFinancials.expenses.length,
    settingsConflict,
    localSettingsBackup: settingsConflict ? {
      totalAmount: localFinancials.totalAmount,
      categoryTargets: localTargets,
    } : null,
    completedAt: serverTimestamp(),
    schemaVersion: 1,
  });

  // Claim only after every write and the completion marker succeed.
  localStorage.setItem(LOCAL_DATA_OWNER_KEY, uid);

  return { migrated: true, expenseCount: localFinancials.expenses.length, settingsConflict };
};

export const getFinancialData = async (): Promise<StoredData> => {
  const user = auth.currentUser;
  if (!user) return getStoredData();
  const [settingsSnapshot, expenses] = await Promise.all([
    getDoc(financialSettings(user.uid)),
    getCloudExpenses(user.uid),
  ]);
  return { totalAmount: Number(settingsSnapshot.data()?.totalAmount ?? 0), expenses };
};

export const updateTotalAmount = async (amount: number): Promise<{ totalAmount: number }> => {
  const user = auth.currentUser;
  if (!user) {
    const data = getStoredData();
    data.totalAmount = amount;
    setStoredData(data);
    return { totalAmount: amount };
  }
  await setDoc(financialSettings(user.uid), {
    totalAmount: amount,
    updatedAt: serverTimestamp(),
    schemaVersion: 1,
  }, { merge: true });
  return { totalAmount: amount };
};

export const addExpense = async (expenseData: NewExpenseData): Promise<Expense[]> => {
  const newExpenses = createExpenses(expenseData);
  const user = auth.currentUser;
  if (!user) {
    const data = getStoredData();
    data.expenses.push(...newExpenses);
    setStoredData(data);
    return data.expenses;
  }

  const batch = writeBatch(db);
  newExpenses.forEach(expense => {
    batch.set(doc(db, 'users', user.uid, 'expenses', expense.id), {
      ...removeUndefined(expense),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
  await batch.commit();
  return getCloudExpenses(user.uid);
};

export const updateExpense = async (updatedExpense: Expense): Promise<Expense[]> => {
  const user = auth.currentUser;
  if (!user) {
    const data = getStoredData();
    const originalExpense = data.expenses.find(expense => expense.id === updatedExpense.id);
    if (!originalExpense) throw new Error('Despesa não encontrada para atualização.');
    data.expenses = originalExpense.groupId
      ? data.expenses.filter(expense => expense.groupId !== originalExpense.groupId)
      : data.expenses.filter(expense => expense.id !== originalExpense.id);
    data.expenses.push(...createExpenses(updatedExpense, originalExpense.groupId));
    setStoredData(data);
    return data.expenses;
  }

  const originalRef = doc(db, 'users', user.uid, 'expenses', updatedExpense.id);
  const originalSnapshot = await getDoc(originalRef);
  if (!originalSnapshot.exists()) throw new Error('Despesa não encontrada para atualização.');
  const original = { ...originalSnapshot.data(), id: originalSnapshot.id } as Expense;
  const batch = writeBatch(db);

  if (original.groupId) {
    const groupSnapshot = await getDocs(query(userExpenses(user.uid), where('groupId', '==', original.groupId)));
    groupSnapshot.docs.forEach(groupDoc => batch.delete(groupDoc.ref));
  } else {
    batch.delete(originalRef);
  }

  createExpenses(updatedExpense, original.groupId).forEach(expense => {
    batch.set(doc(db, 'users', user.uid, 'expenses', expense.id), {
      ...removeUndefined(expense),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
  await batch.commit();
  return getCloudExpenses(user.uid);
};

export const deleteExpense = async (id: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    const data = getStoredData();
    const expense = data.expenses.find(item => item.id === id);
    if (!expense) return;
    data.expenses = expense.groupId
      ? data.expenses.filter(item => item.groupId !== expense.groupId)
      : data.expenses.filter(item => item.id !== id);
    setStoredData(data);
    return;
  }

  const expenseRef = doc(db, 'users', user.uid, 'expenses', id);
  const expenseSnapshot = await getDoc(expenseRef);
  if (!expenseSnapshot.exists()) return;
  const groupId = expenseSnapshot.data().groupId as string | undefined;
  if (!groupId) {
    await deleteDoc(expenseRef);
    return;
  }

  const groupSnapshot = await getDocs(query(userExpenses(user.uid), where('groupId', '==', groupId)));
  const batch = writeBatch(db);
  groupSnapshot.docs.forEach(groupDoc => batch.delete(groupDoc.ref));
  await batch.commit();
};

export const getCustomCategoryTargets = async (): Promise<CategoryTargets> => {
  const user = auth.currentUser;
  if (!user) return getStoredCategoryTargets();
  const snapshot = await getDoc(financialSettings(user.uid));
  return (snapshot.data()?.categoryTargets as CategoryTargets | undefined) ?? {};
};

export const saveCustomCategoryTargets = async (targets: CategoryTargets): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    localStorage.setItem(CATEGORY_TARGETS_KEY, JSON.stringify(targets));
    return;
  }
  await setDoc(financialSettings(user.uid), {
    categoryTargets: targets,
    updatedAt: serverTimestamp(),
    schemaVersion: 1,
  }, { merge: true });
};

export const resetCustomCategoryTargets = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    localStorage.removeItem(CATEGORY_TARGETS_KEY);
    return;
  }
  await setDoc(financialSettings(user.uid), {
    categoryTargets: {},
    updatedAt: serverTimestamp(),
    schemaVersion: 1,
  }, { merge: true });
};

export const suggestCategory = async (_description: string): Promise<{ category: Category }> => {
  return { category: Category.UNCATEGORIZED };
};
