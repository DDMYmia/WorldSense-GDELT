import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

// Authentication Wrapper Component
export default function AuthWrapper({ children }) {
  return (
    <Authenticator
      loginMechanisms={['email']}
      signUpAttributes={['email', 'name']}
      hideSignUp={false}
      formFields={{
        signUp: {
          email: {
            label: 'Email',
            placeholder: 'Enter your email'
          },
          name: {
            label: 'Name',
            placeholder: 'Enter your name'
          },
          password: {
            label: 'Password',
            placeholder: 'Enter your password'
          },
          confirm_password: {
            label: 'Confirm Password',
            placeholder: 'Confirm your password'
          }
        }
      }}
      components={{
        Header() {
          return (
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h1 style={{ color: '#333', fontSize: '32px', margin: '0 0 10px 0' }}>
                🌍 WorldSense
              </h1>
              <h2 style={{ color: '#667eea', fontSize: '20px', margin: '0 0 10px 0' }}>
                Global Event Analysis System
              </h2>
              <p style={{ color: '#666', fontSize: '16px', margin: '0' }}>
                Explore global news events, gain insights into world dynamics
              </p>
            </div>
          );
        },
        Footer() {
          return (
            <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f0f0f0' }}>
              <p style={{ color: '#666', fontSize: '14px', margin: '0' }}>
                Test Account: test@worldsense.com / TempPass123!
              </p>
            </div>
          );
        }
      }}
    >
      {({ signOut, user }) => (
        <div className="app-container">
          <header className="app-header">
            <div className="header-content">
              <h1>🌍 WorldSense</h1>
              <div className="user-info">
                <span>Welcome, {user.attributes.name || user.attributes.email}</span>
                <button onClick={signOut} className="sign-out-btn">
                  Sign Out
                </button>
              </div>
            </div>
          </header>
          <main className="app-main">
            {children}
          </main>
        </div>
      )}
    </Authenticator>
  );
}