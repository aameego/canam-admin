export const DEV_ADMIN_LOGIN = {
  email: 'admin@can-am.ca',
  password: 'Admin@12345',
} as const;

export const isDevLoginPrefillEnabled = (dev: boolean): boolean => dev;
