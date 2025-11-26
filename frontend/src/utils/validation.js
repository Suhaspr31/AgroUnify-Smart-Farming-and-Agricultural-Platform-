export const validateEmail = (email) => {
  const errors = [];
  
  if (!email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please enter a valid email address');
  }
  
  return errors;
};

export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
  }
  
  return errors;
};

export const validatePhone = (phone) => {
  const errors = [];
  
  if (!phone) {
    errors.push('Phone number is required');
  } else if (!/^[6-9]\d{9}$/.test(phone)) {
    errors.push('Please enter a valid 10-digit Indian phone number');
  }
  
  return errors;
};

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return [`${fieldName} is required`];
  }
  return [];
};

export const validateNumber = (value, fieldName, min, max) => {
  const errors = [];
  
  if (isNaN(value)) {
    errors.push(`${fieldName} must be a number`);
  } else {
    const num = Number(value);
    if (min !== undefined && num < min) {
      errors.push(`${fieldName} must be at least ${min}`);
    }
    if (max !== undefined && num > max) {
      errors.push(`${fieldName} must not exceed ${max}`);
    }
  }
  
  return errors;
};

export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = formData[field];
    const fieldErrors = [];
    
    if (rule.required) {
      fieldErrors.push(...validateRequired(value, rule.label || field));
    }
    
    if (value && rule.type === 'email') {
      fieldErrors.push(...validateEmail(value));
    }
    
    if (value && rule.type === 'phone') {
      fieldErrors.push(...validatePhone(value));
    }
    
    if (value && rule.type === 'number') {
      fieldErrors.push(...validateNumber(value, rule.label || field, rule.min, rule.max));
    }
    
    if (value && rule.minLength && value.length < rule.minLength) {
      fieldErrors.push(`${rule.label || field} must be at least ${rule.minLength} characters`);
    }
    
    if (value && rule.maxLength && value.length > rule.maxLength) {
      fieldErrors.push(`${rule.label || field} must not exceed ${rule.maxLength} characters`);
    }
    
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  });
  
  return errors;
};
