// passwordUtils.ts

/**
 * Validates a password to ensure it meets specified criteria.
 * Checks for a minimum of 8 characters with at least one uppercase letter,
 * one lowercase letter, one number, and one special character.
 * @param password The password to validate.
 * @returns true if the password meets the criteria, false otherwise.
 */
export const validatePassword = (password: string): boolean => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(password);
  };
  