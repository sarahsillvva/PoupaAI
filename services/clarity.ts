import Clarity from '@microsoft/clarity';

let isInitialized = false;

export const initializeClarity = () => {
  const projectId = import.meta.env.VITE_CLARITY_PROJECT_ID?.trim();

  if (isInitialized || !projectId || import.meta.env.DEV) return;

  Clarity.init(projectId);
  isInitialized = true;
};
