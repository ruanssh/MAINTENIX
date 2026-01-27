import type { Id } from "./api";

export type User = {
  id: Id;
  name: string;
  email: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateUserRequest = {
  name: string;
  email: string;
  password: string;
};
