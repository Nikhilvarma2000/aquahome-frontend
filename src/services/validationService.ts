export const validationService = {
    /**
     * Validates if the input is empty
     * @param value - The value to check
     * @returns Error message if empty, empty string otherwise
     */
    required: (value: string): string => {
      return !value || value.trim() === '' ? 'This field is required' : '';
    },
  
    /**
     * Validates email format
     * @param email - The email to validate
     * @returns Error message if invalid, empty string otherwise
     */
    email: (email: string): string => {
      if (!email) return '';
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !emailRegex.test(email) ? 'Please enter a valid email address' : '';
    },
  
    /**
     * Validates phone number format (Indian format)
     * @param phone - The phone number to validate
     * @returns Error message if invalid, empty string otherwise
     */
    phone: (phone: string): string => {
      if (!phone) return '';
      
      // Supports format: +91 XXXXXXXXXX or XXXXXXXXXX (10 digits)
      const phoneRegex = /^(\+91[\s]?)?[0-9]{10}$/;
      return !phoneRegex.test(phone) ? 'Please enter a valid 10-digit phone number' : '';
    },
  
    /**
     * Validates PIN code (Indian postal code)
     * @param pincode - The PIN code to validate
     * @returns Error message if invalid, empty string otherwise
     */
    pincode: (pincode: string): string => {
      if (!pincode) return '';
      
      const pincodeRegex = /^[1-9][0-9]{5}$/;
      return !pincodeRegex.test(pincode) ? 'Please enter a valid 6-digit PIN code' : '';
    },
  
    /**
     * Validates minimum length of input
     * @param value - The value to check
     * @param minLength - Minimum length required
     * @returns Error message if too short, empty string otherwise
     */
    minLength: (value: string, minLength: number): string => {
      if (!value) return '';
      
      return value.length < minLength 
        ? `This field must be at least ${minLength} characters` 
        : '';
    },
  
    /**
     * Validates maximum length of input
     * @param value - The value to check
     * @param maxLength - Maximum length allowed
     * @returns Error message if too long, empty string otherwise
     */
    maxLength: (value: string, maxLength: number): string => {
      if (!value) return '';
      
      return value.length > maxLength 
        ? `This field must not exceed ${maxLength} characters` 
        : '';
    },
  
    /**
     * Validates password strength
     * @param password - The password to validate
     * @returns Error message if weak, empty string otherwise
     */
    password: (password: string): string => {
      if (!password) return '';
      
      if (password.length < 8) {
        return 'Password must be at least 8 characters long';
      }
      
      // Check for at least one uppercase letter, one lowercase letter, and one number
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      
      if (!hasUpperCase || !hasLowerCase || !hasNumber) {
        return 'Password must contain uppercase, lowercase letters and numbers';
      }
      
      return '';
    },

    /**
     * Validates that passwords match
     * @param password - The password
     * @param confirmPassword - The confirmation password
     * @returns Error message if they don't match, empty string otherwise
     */
    passwordsMatch: (password: string, confirmPassword: string): string => {
      if (!confirmPassword) return '';
      
      return password !== confirmPassword ? 'Passwords do not match' : '';
    },
  
    /**
     * Validates a date is in the future
     * @param dateString - The date string to validate
     * @returns Error message if not in future, empty string otherwise
     */
    futureDate: (dateString: string): string => {
      if (!dateString) return '';
      
      const selectedDate = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return selectedDate < today 
        ? 'Date must be in the future' 
        : '';
    },
  
    /**
     * Validates a number is greater than a minimum value
     * @param value - The number to validate
     * @param min - The minimum value
     * @returns Error message if too small, empty string otherwise
     */
    minValue: (value: number, min: number): string => {
      if (value === undefined || value === null) return '';
      
      return value < min ? `Value must be at least ${min}` : '';
    },
  
    /**
     * Validates a number is less than a maximum value
     * @param value - The number to validate
     * @param max - The maximum value
     * @returns Error message if too large, empty string otherwise
     */
    maxValue: (value: number, max: number): string => {
      if (value === undefined || value === null) return '';
      
      return value > max ? `Value must not exceed ${max}` : '';
    },
  
    /**
     * Runs multiple validation functions and returns the first error
     * @param value - The value to validate
     * @param validations - Array of validation functions to run
     * @returns The first error message, or empty string if all validations pass
     */
    runValidations: (value: any, validations: Array<(val: any) => string>): string => {
      for (const validation of validations) {
        const error = validation(value);
        if (error) {
          return error;
        }
      }
      return '';
    },

    isEmpty: (value: string): boolean => {
      return (value.length == 0 || value !== "");
    }
  };
  
  export default validationService;