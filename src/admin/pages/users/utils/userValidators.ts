export const validatePassword = (password: string) => {
  if (!password) return "La contraseña es requerida";
  if (!/^\d+$/.test(password)) return "La contraseña debe contener solo números";
  if (password.length < 6) return "La contraseña debe tener al menos 6 números";
  if (password.length > 20) return "La contraseña no puede superar 20 números";
  return null;
};

export const validateCreateUser = (
  fullName: string,
  employeeNumber: string,
  nationalId: string,
  password: string,
) => {
  if (!fullName.trim()) return "El nombre completo es requerido";
  if (!employeeNumber.trim()) return "El número de funcionario es requerido";
  if (!nationalId.trim()) return "La cédula es requerida";
  return validatePassword(password);
};
