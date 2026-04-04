"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthLayout from './AuthLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';
import { 
  validateEmail, 
  validatePassword, 
  validatePasswordMatch, 
  validateRequired 
} from '../utils/RegistrationValidation';

export default function Register() {
  const router = useRouter();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate first name
    const firstNameValidation = validateRequired(formData.first_name, 'First name');
    if (!firstNameValidation.isValid) {
      newErrors.first_name = firstNameValidation.message!;
    }

    // Validate last name
    const lastNameValidation = validateRequired(formData.last_name, 'Last name');
    if (!lastNameValidation.isValid) {
      newErrors.last_name = lastNameValidation.message!;
    }

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.message!;
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message!;
    }

    // Validate password confirmation
    const passwordMatchValidation = validatePasswordMatch(
      formData.password, 
      formData.password_confirmation
    );
    if (!passwordMatchValidation.isValid) {
      newErrors.password_confirmation = passwordMatchValidation.message!;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register(formData);
      // Wait a moment for state to update, then redirect to feed page
      setTimeout(() => {
        router.replace('/feed');
      }, 100);
    } catch (error: any) {
      // Handle registration errors (e.g., email already exists)
      if (error.message.includes('email')) {
        setErrors(prev => ({
          ...prev,
          email: 'This email is already registered'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          general: error.message || 'Registration failed. Please try again.'
        }));
      }
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout variant="login">
      <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
        <div className="_social_login_left">
          <div className="_social_login_left_image">
            <img src="/assets/images/login.png" alt="Image" className="_left_img" />
          </div>
        </div>
      </div>

      <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
        <div className="_social_login_content">
          <div className="_social_login_left_logo _mar_b28">
            <img src="/assets/images/logo.svg" alt="Image" className="_left_logo" />
          </div>
          <p className="_social_login_content_para _mar_b8">Get Started</p>
          <h4 className="_social_login_content_title _titl4 _mar_b50">Create your account</h4>

          <button type="button" className="_social_login_content_btn _mar_b40">
            <img src="/assets/images/google.svg" alt="Image" className="_google_img" /> <span>Or sign-up with Google</span>
          </button>

          <div className="_social_login_content_bottom_txt _mar_b40"> <span>Or</span></div>

          {errors.general && (
            <div style={{ 
              padding: '10px', 
              marginBottom: '20px', 
              backgroundColor: '#fee', 
              color: '#c33', 
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {errors.general}
            </div>
          )}

          <form className="_social_login_form" onSubmit={handleSubmit}>
            <div className="row">
              {/* First Name */}
              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <div className="_social_login_form_input _mar_b14">
                  <label className="_social_login_label _mar_b8">First Name</label>
                  <input 
                    type="text" 
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="form-control _social_login_input" 
                  />
                  {errors.first_name && (
                    <small style={{ color: '#c33', fontSize: '12px' }}>{errors.first_name}</small>
                  )}
                </div>
              </div>
              {/* Last Name */}
              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <div className="_social_login_form_input _mar_b14">
                  <label className="_social_login_label _mar_b8">Last Name</label>
                  <input 
                    type="text" 
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="form-control _social_login_input" 
                  />
                  {errors.last_name && (
                    <small style={{ color: '#c33', fontSize: '12px' }}>{errors.last_name}</small>
                  )}
                </div>
              </div>
              {/* Email */}
              <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                <div className="_social_login_form_input _mar_b14">
                  <label className="_social_login_label _mar_b8">Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control _social_login_input" 
                  />
                  {errors.email && (
                    <small style={{ color: '#c33', fontSize: '12px' }}>{errors.email}</small>
                  )}
                </div>
              </div>
              {/* Password */}
              <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                <div className="_social_login_form_input _mar_b14" style={{ position: 'relative' }}>
                  <label className="_social_login_label _mar_b8">Password</label>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-control _social_login_input" 
                    style={{ paddingRight: '40px' }}
                  />
                  <FontAwesomeIcon 
                    icon={showPassword ? faEyeSlash : faEye} 
                    onClick={togglePasswordVisibility}
                    style={{
                      position: 'absolute',
                      right: '15px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      cursor: 'pointer',
                      color: '#666',
                      marginTop: '12px'
                    }}
                  />
                  {errors.password && (
                    <small style={{ color: '#c33', fontSize: '12px' }}>{errors.password}</small>
                  )}
                </div>
              </div>
              {/* Confirm Password */}
              <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                <div className="_social_login_form_input _mar_b14" style={{ position: 'relative' }}>
                  <label className="_social_login_label _mar_b8">Confirm Password</label>
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    className="form-control _social_login_input" 
                    style={{ paddingRight: '40px' }}
                  />
                  <FontAwesomeIcon 
                    icon={showConfirmPassword ? faEyeSlash : faEye} 
                    onClick={toggleConfirmPasswordVisibility}
                    style={{
                      position: 'absolute',
                      right: '15px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      cursor: 'pointer',
                      color: '#666',
                      marginTop: '12px'
                    }}
                  />
                  {errors.password_confirmation && (
                    <small style={{ color: '#c33', fontSize: '12px' }}>{errors.password_confirmation}</small>
                  )}
                </div>
              </div>
            </div>

            {/* Register Button */}
            <div className="row">
              <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
                <div className="_social_login_form_btn _mar_t40 _mar_b60">
                  <button 
                    type="submit" 
                    className="_social_login_form_btn_link _btn1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Bottom Text */}
          <div className="row">
            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
              <div className="_social_login_bottom_txt">
                <p className="_social_login_bottom_txt_para">
                  Already have an account? <Link href="/login">Login</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
