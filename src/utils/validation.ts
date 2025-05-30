/**
 * Validates an email address
 * @param email The email address to validate
 * @returns true if the email is valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
    if (!email) return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Validates a password meets minimum requirements
   * @param password The password to validate
   * @returns true if the password is valid, false otherwise
   */
  export const validatePassword = (password: string): boolean => {
    return !!password && password.length >= 6;
  };

  export const validateName = (name: string): boolean => {
    return !!name && name.length >= 0
  }
  
  /**
   * Validates that a field is not empty
   * @param value The value to check
   * @returns true if the value is not empty, false otherwise
   */
  export const validateRequired = (value: string): boolean => {
    return !!value && value.trim() !== '';
  };
  
  /**
   * Validates a phone number (Indian format)
   * @param phone The phone number to validate
   * @returns true if the phone number is valid, false otherwise
   */
  export const validatePhone = (phone: string): boolean => {
    if (!phone) return false;
    
    // Supports format: +91 XXXXXXXXXX or XXXXXXXXXX (10 digits)
    const phoneRegex = /^(\+91[\s]?)?[0-9]{10}$/;
    return phoneRegex.test(phone);
  };
  
  /**
   * Validates a PIN code (Indian postal code)
   * @param pincode The PIN code to validate
   * @returns true if the PIN code is valid, false otherwise
   */
  export const validatePincode = (pincode: string): boolean => {
    if (!pincode) return false;
    
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(pincode);
  };
  
  /**
   * Validates that passwords match
   * @param password The password
   * @param confirmPassword The confirmation password
   * @returns true if the passwords match, false otherwise
   */
  export const validatePasswordsMatch = (password: string, confirmPassword: string): boolean => {
    return password === confirmPassword;
  };
  
  /**
   * Validates that a date is in the future
   * @param dateString The date string to validate
   * @returns true if the date is in the future, false otherwise
   */
  export const validateFutureDate = (dateString: string): boolean => {
    if (!dateString) return false;
    
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return selectedDate > today;
  };