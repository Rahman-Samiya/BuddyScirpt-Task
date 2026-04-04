"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import AuthLayout from './AuthLayout';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail } from '../utils/RegistrationValidation';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.message!;
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      await login(formData);
      // Wait a moment for state to update, then redirect to feed page
      setTimeout(() => {
        router.replace('/feed');
      }, 100);
    } catch (error: any) {
      // Handle login errors
      setErrors(prev => ({
        ...prev,
        general: error.message || 'Login failed. Please check your credentials.'
      }));
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
          <p className="_social_login_content_para _mar_b8">Welcome back</p>
          <h4 className="_social_login_content_title _titl4 _mar_b50">Login to your account</h4>
          <button type="button" className="_social_login_content_btn _mar_b40">
            <img src="/assets/images/google.svg" alt="Image" className="_google_img" /> <span>Or sign-in with google</span>
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
            </div>
            <div className="row">
              <div className="col-lg-6 col-xl-6 col-md-6 col-sm-12">
                <div className="form-check _social_login_form_check">
                  <input className="form-check-input _social_login_form_check_input" type="radio" name="remember" id="remember" defaultChecked />
                  <label className="form-check-label _social_login_form_check_label" htmlFor="remember">Remember me</label>
                </div>
              </div>
              <div className="col-lg-6 col-xl-6 col-md-6 col-sm-12">
                <div className="_social_login_form_left">
                  <p className="_social_login_form_left_para">Forgot password?</p>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
                <div className="_social_login_form_btn _mar_t40 _mar_b60">
                  <button 
                    type="submit" 
                    className="_social_login_form_btn_link _btn1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Logging in...' : 'Login now'}
                  </button>
                </div>
              </div>
            </div>
          </form>
          <div className="row">
            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
              <div className="_social_login_bottom_txt">
                <p className="_social_login_bottom_txt_para">Dont have an account? <Link href="/register">Create New Account</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
