export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
}
export interface RegisterPayload {
  email: string;
  name: string;
  password: string;
}

export interface RegisterResult {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: "USER" | "ADMIN";
  };
}
