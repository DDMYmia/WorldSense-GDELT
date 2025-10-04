import React, { useState } from 'react';

const LoginPromptModal = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { signIn, signUp } = await import('aws-amplify/auth');
      
      if (isSignUp) {
        // Registration flow
        await signUp({
          username: email,
          password,
          options: {
            userAttributes: {
              email,
              name: email.split('@')[0]
            }
          }
        });
        
        // Auto sign in after successful registration
        try {
          await signIn({ username: email, password });
          onLogin(email, password);
          setEmail('');
          setPassword('');
          setError('Registration and login successful!');
        } catch (signInError) {
          setError('Registration successful! Please sign in manually.');
        }
      } else {
        // Login flow
        await signIn({ username: email, password });
        onLogin(email, password);
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setError(err.message || (isSignUp ? 'Registration failed' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={handleBackdropClick}
    >
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        width: '400px',
        maxWidth: '90%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#9ca3af',
            padding: '4px',
            borderRadius: '4px',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#f3f4f6';
            e.target.style.color = '#374151';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#9ca3af';
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '24px', 
            fontWeight: '600', 
            color: '#1e293b',
            marginBottom: '8px'
          }}>
            Welcome to WorldSense GDELT
          </h2>
          <p style={{ 
            margin: 0, 
            color: '#64748b', 
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            Login to unlock personalized features, save your preferences, and get the best experience!
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#ffffff',
                color: '#374151',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#ffffff',
                color: '#374151',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '20px',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

                 <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                   <button
                     type="submit"
                     disabled={loading || !email || !password}
                     style={{
                       flex: 1,
                       padding: '12px 16px',
                       backgroundColor: loading || !email || !password ? '#9ca3af' : '#3b82f6',
                       color: 'white',
                       border: 'none',
                       borderRadius: '8px',
                       fontSize: '16px',
                       fontWeight: '500',
                       cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
                       transition: 'all 0.2s ease'
                     }}
                     onMouseOver={(e) => {
                       if (!loading && email && password) {
                         e.target.style.backgroundColor = '#2563eb';
                       }
                     }}
                     onMouseOut={(e) => {
                       if (!loading && email && password) {
                         e.target.style.backgroundColor = '#3b82f6';
                       }
                     }}
                   >
                     {loading ? (isSignUp ? 'Signing up...' : 'Logging in...') : (isSignUp ? 'Sign Up' : 'Login')}
                   </button>
                   
                   <button
                     type="button"
                     onClick={() => {
                       setIsSignUp(!isSignUp);
                       setError('');
                     }}
                     disabled={loading}
                     style={{
                       padding: '12px 16px',
                       backgroundColor: '#f3f4f6',
                       color: '#374151',
                       border: '1px solid #d1d5db',
                       borderRadius: '8px',
                       fontSize: '14px',
                       fontWeight: '500',
                       cursor: loading ? 'not-allowed' : 'pointer',
                       transition: 'all 0.2s ease'
                     }}
                     onMouseOver={(e) => {
                       if (!loading) {
                         e.target.style.backgroundColor = '#e5e7eb';
                       }
                     }}
                     onMouseOut={(e) => {
                       if (!loading) {
                         e.target.style.backgroundColor = '#f3f4f6';
                       }
                     }}
                   >
                     {isSignUp ? 'Login' : 'Sign Up'}
                   </button>
                 </div>
        </form>

        {/* Footer */}
        <div style={{ 
          textAlign: 'center',
          fontSize: '12px',
          color: '#9ca3af'
        }}>
          Or click outside to continue as guest
        </div>
      </div>
    </div>
  );
};

export default LoginPromptModal;
