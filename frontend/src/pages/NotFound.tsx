"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

const NotFound = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCanGoBack(window.history.length > 1);
    }
  }, []);

  const handleGoBack = () => {
    if (canGoBack) {
      router.back(); // Go back one page in history
    } else {
      router.replace('/'); // Fallback to home page
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8f9fa',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          {/* 404 Icon */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{
              fontSize: '100px',
              fontWeight: 'bold',
              color: '#e74c3c',
              marginBottom: '10px'
            }}>
              404
            </div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: '15px'
            }}>
              Page Not Found
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#7f8c8d',
              lineHeight: '1.6'
            }}>
              Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Go Back Button */}
            {canGoBack && (
              <button
                onClick={handleGoBack}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  backgroundColor: '#3498db',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2980b9'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3498db'}
              >
                ← Back to Previous Page
              </button>
            )}

            {/* Home/Login Button */}
            <Link
              href={isAuthenticated ? "/feed" : "/login"}
              style={{
                width: '100%',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'white',
                backgroundColor: '#27ae60',
                border: 'none',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#229954'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#27ae60'}
            >
              {isAuthenticated ? '🏠 Go to Feed' : '🏠 Go to Login'}
            </Link>
          </div>

          {/* Additional Help */}
          <div style={{
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid #ecf0f1'
          }}>
            <p style={{
              fontSize: '12px',
              color: '#95a5a6'
            }}>
              If you believe this is a mistake, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
