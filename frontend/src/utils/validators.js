export const validators = {
  email: (value) => {
    if (!value) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Invalid email format';
    return null;
  },

  password: (value) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    return null;
  },

  phone: (value) => {
    if (!value) return 'Phone number is required';
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(value)) return 'Invalid phone number';
    return null;
  },

  name: (value) => {
    if (!value) return 'Name is required';
    if (value.length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s]+$/.test(value)) return 'Name can only contain letters';
    return null;
  },

  pincode: (value) => {
    if (!value) return 'Pincode is required';
    if (!/^\d{6}$/.test(value)) return 'Invalid pincode';
    return null;
  },

  aadhar: (value) => {
    if (!value) return 'Aadhar number is required';
    if (!/^\d{12}$/.test(value)) return 'Invalid Aadhar number';
    return null;
  },

  pan: (value) => {
    if (!value) return 'PAN is required';
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) return 'Invalid PAN format';
    return null;
  },

  ifsc: (value) => {
    if (!value) return 'IFSC code is required';
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) return 'Invalid IFSC code';
    return null;
  },

  area: (value) => {
    if (!value) return 'Area is required';
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return 'Invalid area';
    return null;
  },

  price: (value) => {
    if (!value && value !== 0) return 'Price is required';
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) return 'Invalid price';
    return null;
  },

  quantity: (value) => {
    if (!value) return 'Quantity is required';
    const num = parseInt(value);
    if (isNaN(num) || num <= 0) return 'Invalid quantity';
    return null;
  }
};

export const validateField = (fieldName, value) => {
  const validator = validators[fieldName];
  return validator ? validator(value) : null;
};

export const validateMultipleFields = (fields) => {
  const errors = {};
  Object.keys(fields).forEach(fieldName => {
    const error = validateField(fieldName, fields[fieldName]);
    if (error) errors[fieldName] = error;
  });
  return errors;
};
