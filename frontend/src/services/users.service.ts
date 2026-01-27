import { http } from "../api/http";
import type { User, CreateUserRequest } from "../types/users";

export const UsersService = {
  async create(payload: CreateUserRequest): Promise<User> {
    const { data } = await http.post<User>("/users", payload);
    return data;
  },

  async me(): Promise<User> {
    const { data } = await http.get<User>("/users/me");
    return data;
  },

  async list(): Promise<User[]> {
    const { data } = await http.get<User[]>("/users");
    return data;
  },
};
