import type {
  LoginErrors,
  LoginValues,
} from "../domain/login";

export function validateLogin(
  values: LoginValues,
): LoginErrors {
  const errors: LoginErrors = {};
  const email = values.email.trim();

  if (!email) {
    errors.email = "Escribe tu correo electrónico.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Escribe un correo electrónico válido.";
  }

  if (!values.password) {
    errors.password = "Escribe tu contraseña.";
  }

  return errors;
}