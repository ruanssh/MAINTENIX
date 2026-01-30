export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
};

export type ResetPasswordRequest = {
  email: string;
};

export type ResetPasswordResponse = {
  success: boolean;
};
