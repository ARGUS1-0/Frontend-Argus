export interface LoginValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginErrors {
  email?: string;
  password?: string;
}