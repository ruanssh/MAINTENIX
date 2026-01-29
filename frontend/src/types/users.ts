import type { Id } from "./api";

export type User = {
  id: Id;
  name: string;
  email: string;
  active: boolean;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type UserRole = 1 | 2;

export type CreateUserRequest = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type UpdateUserRequest = {
  name?: string;
  email?: string;
  role?: UserRole;
  active?: boolean;
};
