// emailUtils.ts

/**
 * Validates an email address using a regular expression.
 * @param email The email address to validate.
 * @returns true if the email is in a valid format, false otherwise.
 */
export const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  