import type { User } from '$lib/backend/db/schema';

export type Variables = {
  loggedInUser: User;
};

export type AppEnv = {
  Variables: Variables;
};
