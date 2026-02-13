export interface LoggedUserInterface {
  id: number;
  email: string;
  role_id: number;
  role: string;
  iat: number;
  exp: number;
}
export interface LoginResponseInterface {
  user: {
    id: number;
    email: string;
    role: string;
  };
  access_token?: string;
  expires_in?: string;
}