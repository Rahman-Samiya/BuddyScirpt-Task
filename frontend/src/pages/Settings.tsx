"use client";

import { useState } from 'react';
import { FeedHeader, MobileMenu, MobileBottomNav, LeftSidebar, RightSidebar } from '../components/feed';
import { useAuth } from '../contexts/AuthContext';
import { validatePassword, validateRequired } from '../utils/RegistrationValidation';
import { userService } from '../services/userService';

export default function Settings() {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || ''
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateProfileForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const firstNameValidation = validateRequired(profileData.first_name, 'First name');
    if (!firstNameValidation.isValid) {
      newErrors.first_name = firstNameValidation.message!;
    }

    const lastNameValidation = validateRequired(profileData.last_name, 'Last name');
    if (!lastNameValidation.isValid) {
      newErrors.last_name = lastNameValidation.message!;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.current_password) {
      newErrors.current_password = 'Current password is required';
    }

    const passwordValidation = validatePassword(passwordData.new_password);
    if (!passwordValidation.isValid) {
      newErrors.new_password = passwordValidation.message!;
    }

    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      newErrors.new_password_confirmation = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateProfileForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await userService.updateProfile(profileData);
      // Update user in localStorage
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      setSuccessMessage('Profile updated successfully!');
    } catch (error: any) {
      setErrors(prev => ({
        ...prev,
        general: error.response?.data?.message || error.message || 'Failed to update profile'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validatePasswordForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await userService.updatePassword(passwordData);
      setSuccessMessage('Password updated successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      });
    } catch (error: any) {
      setErrors(prev => ({
        ...prev,
        general: error.response?.data?.message || error.message || 'Failed to update password'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`_layout _layout_main_wrapper ${darkMode ? '_dark_wrapper' : ''}`}>
      <div className="_layout_mode_swithing_btn">
        <button type="button" className="_layout_swithing_btn_link" onClick={toggleDarkMode}>
          <div className="_layout_swithing_btn">
            <div className="_layout_swithing_btn_round"></div>
          </div>
          <div className="_layout_change_btn_ic1">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="16" fill="none" viewBox="0 0 11 16">
              <path fill="#fff" d="M2.727 14.977l.04-.498-.04.498zm-1.72-.49l.489-.11-.489.11zM3.232 1.212L3.514.8l-.282.413zM9.792 8a6.5 6.5 0 00-6.5-6.5v-1a7.5 7.5 0 017.5 7.5h-1zm-6.5 6.5a6.5 6.5 0 006.5-6.5h1a7.5 7.5 0 01-7.5 7.5v-1zm-.525-.02c.173.013.348.02.525.02v1c-.204 0-.405-.008-.605-.024l.08-.997zm-.261-1.83A6.498 6.498 0 005.792 7h1a7.498 7.498 0 01-3.791 6.52l-.495-.87zM5.792 7a6.493 6.493 0 00-2.841-5.374L3.514.8A7.493 7.493 0 016.792 7h-1zm-3.105 8.476c-.528-.042-.985-.077-1.314-.155-.316-.075-.746-.242-.854-.726l.977-.217c-.028-.124-.145-.09.106-.03.237.056.6.086 1.165.131l-.08.997zm.314-1.956c-.622.354-1.045.596-1.31.792a.967.967 0 00-.204.185c-.01.013.027-.038.009-.12l-.977.218a.836.836 0 01.144-.666c.112-.162.27-.3.433-.42.324-.24.814-.519 1.41-.858L3 13.52zM3.292 1.5a.391.391 0 00.374-.285A.382.382 0 003.514.8l-.563.826A.618.618 0 012.702.95a.609.609 0 01.59-.45v1z"/>
            </svg>
          </div>
          <div className="_layout_change_btn_ic2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4.389" stroke="#fff" transform="rotate(-90 12 12)"/>
              <path stroke="#fff" strokeLinecap="round" d="M3.444 12H1M23 12h-2.444M5.95 5.95L4.222 4.22M19.778 19.779L18.05 18.05M12 3.444V1M12 23v-2.445M18.05 5.95l1.728-1.729M4.222 19.779L5.95 18.05"/>
            </svg>
          </div>
        </button>
      </div>
      <div className="_main_layout">
        {/* Desktop Menu */}
        <FeedHeader />
        {/* Mobile Menu */}
        <MobileMenu />
        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
        {/* Main Layout Structure */}
        <div className="container _custom_container">
          <div className="_layout_inner_wrap">
            <div className="row">
              {/* Left Sidebar */}
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <LeftSidebar />
              </div>
              {/* Middle - Settings Content */}
              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <div className="_layout_middle_wrap">
                  <div className="_layout_middle_inner">
                    {/* Settings Card */}
                    <div className="_post_feed_card _mar_b16">
                      <div className="_post_feed_card_inner">
                        <h3 className="_post_feed_title" style={{ marginBottom: '20px' }}>Settings</h3>
                        
                        {/* Tabs */}
                        <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', marginBottom: '20px' }}>
                          <button
                            onClick={() => setActiveTab('profile')}
                            style={{
                              flex: 1,
                              padding: '12px',
                              fontSize: '14px',
                              fontWeight: '500',
                              border: 'none',
                              background: 'transparent',
                              color: activeTab === 'profile' ? '#377DFF' : '#666',
                              borderBottom: activeTab === 'profile' ? '2px solid #377DFF' : 'none',
                              cursor: 'pointer'
                            }}
                          >
                            Profile Information
                          </button>
                          <button
                            onClick={() => setActiveTab('password')}
                            style={{
                              flex: 1,
                              padding: '12px',
                              fontSize: '14px',
                              fontWeight: '500',
                              border: 'none',
                              background: 'transparent',
                              color: activeTab === 'password' ? '#377DFF' : '#666',
                              borderBottom: activeTab === 'password' ? '2px solid #377DFF' : 'none',
                              cursor: 'pointer'
                            }}
                          >
                            Change Password
                          </button>
                        </div>

                        {/* Success Message */}
                        {successMessage && (
                          <div style={{
                            padding: '12px',
                            marginBottom: '20px',
                            backgroundColor: '#d4edda',
                            color: '#155724',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}>
                            {successMessage}
                          </div>
                        )}

                        {/* Error Message */}
                        {errors.general && (
                          <div style={{
                            padding: '12px',
                            marginBottom: '20px',
                            backgroundColor: '#f8d7da',
                            color: '#721c24',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}>
                            {errors.general}
                          </div>
                        )}

                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                          <form onSubmit={handleProfileSubmit}>
                            <div className="_social_login_form_input _mar_b14">
                              <label className="_social_login_label _mar_b8">First Name</label>
                              <input
                                type="text"
                                name="first_name"
                                value={profileData.first_name}
                                onChange={handleProfileChange}
                                className="form-control _social_login_input"
                              />
                              {errors.first_name && (
                                <small style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.first_name}</small>
                              )}
                            </div>

                            <div className="_social_login_form_input _mar_b14">
                              <label className="_social_login_label _mar_b8">Last Name</label>
                              <input
                                type="text"
                                name="last_name"
                                value={profileData.last_name}
                                onChange={handleProfileChange}
                                className="form-control _social_login_input"
                              />
                              {errors.last_name && (
                                <small style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.last_name}</small>
                              )}
                            </div>

                            <div className="_social_login_form_input _mar_b14">
                              <label className="_social_login_label _mar_b8">Email</label>
                              <input
                                type="email"
                                name="email"
                                value={profileData.email}
                                disabled
                                className="form-control _social_login_input"
                                style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                              />
                              <small style={{ color: '#7f8c8d', fontSize: '12px' }}>Email cannot be changed</small>
                            </div>

                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="_social_login_form_btn_link _btn1"
                              style={{ marginTop: '20px' }}
                            >
                              {isSubmitting ? 'Updating...' : 'Update Profile'}
                            </button>
                          </form>
                        )}

                        {/* Password Tab */}
                        {activeTab === 'password' && (
                          <form onSubmit={handlePasswordSubmit}>
                            <div className="_social_login_form_input _mar_b14">
                              <label className="_social_login_label _mar_b8">Current Password</label>
                              <input
                                type="password"
                                name="current_password"
                                value={passwordData.current_password}
                                onChange={handlePasswordChange}
                                className="form-control _social_login_input"
                              />
                              {errors.current_password && (
                                <small style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.current_password}</small>
                              )}
                            </div>

                            <div className="_social_login_form_input _mar_b14">
                              <label className="_social_login_label _mar_b8">New Password</label>
                              <input
                                type="password"
                                name="new_password"
                                value={passwordData.new_password}
                                onChange={handlePasswordChange}
                                className="form-control _social_login_input"
                              />
                              {errors.new_password && (
                                <small style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.new_password}</small>
                              )}
                              <small style={{ color: '#7f8c8d', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                                Must be at least 8 characters with uppercase, number, and special character
                              </small>
                            </div>

                            <div className="_social_login_form_input _mar_b14">
                              <label className="_social_login_label _mar_b8">Confirm New Password</label>
                              <input
                                type="password"
                                name="new_password_confirmation"
                                value={passwordData.new_password_confirmation}
                                onChange={handlePasswordChange}
                                className="form-control _social_login_input"
                              />
                              {errors.new_password_confirmation && (
                                <small style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.new_password_confirmation}</small>
                              )}
                            </div>

                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="_social_login_form_btn_link _btn1"
                              style={{ marginTop: '20px' }}
                            >
                              {isSubmitting ? 'Updating...' : 'Update Password'}
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Right Sidebar */}
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <RightSidebar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
