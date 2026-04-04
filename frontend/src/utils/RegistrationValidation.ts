export interface ValidationResult {
  isValid: boolean;
  message?: string;
}
/**
 * Validates password requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one number
 * - At least one special character
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }

  return { isValid: true };
};

/**
 * Validates email format
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

/**
 * Validates if passwords match
 */
export const validatePasswordMatch = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, message: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match' };
  }

  return { isValid: true };
};

/**
 * Validates required field
 */
export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, message: `${fieldName} is required` };
  }

  return { isValid: true };
};
