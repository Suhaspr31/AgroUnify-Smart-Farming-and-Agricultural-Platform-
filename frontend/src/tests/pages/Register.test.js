import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Register from '../../pages/Auth/Register';

// Mock all dependencies
jest.mock('react-router-dom', () => ({
  Link: ({ children }) => <a>{children}</a>,
  useNavigate: () => jest.fn(),
}));

jest.mock('react-icons/fi', () => ({
  FiEye: () => <span>eye-icon</span>,
  FiEyeOff: () => <span>eye-off-icon</span>,
}));

jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    register: jest.fn(),
  }),
}));

jest.mock('../../context/AppContext', () => ({
  useApp: () => ({
    showNotification: jest.fn(),
  }),
}));

jest.mock('../../utils/validators', () => ({
  validateField: jest.fn(),
}));

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders register form correctly', () => {
    render(<Register />);

    expect(screen.getByText('Create Your Account')).toBeInTheDocument();
    expect(screen.getByText('Join AgroUnify and start your farming journey.')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Location')).toBeInTheDocument();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });

  test('allows user input in form fields', () => {
    render(<Register />);

    const nameInput = screen.getByLabelText('Full Name');
    const emailInput = screen.getByLabelText('Email Address');
    const phoneInput = screen.getByLabelText('Phone Number');
    const locationInput = screen.getByLabelText('Location');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '9876543210' } });
    fireEvent.change(locationInput, { target: { value: 'New Delhi' } });

    expect(nameInput.value).toBe('John Doe');
    expect(emailInput.value).toBe('john@example.com');
    expect(phoneInput.value).toBe('9876543210');
    expect(locationInput.value).toBe('New Delhi');
  });

  test('toggles password visibility', () => {
    render(<Register />);

    const passwordInput = screen.getByLabelText('Password');
    const toggleButton = passwordInput.parentElement.querySelector('.password-toggle');

    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('form submission is handled', () => {
    render(<Register />);

    const submitButton = screen.getByText('Create Account');
    expect(submitButton).toBeInTheDocument();
    expect(submitButton.type).toBe('submit');
  });
});