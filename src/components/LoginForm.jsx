import React, { useState } from 'react';
import { signIn, signUp } from 'aws-amplify/auth';

export default function LoginForm({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login
        const user = await signIn({ username: email, password });
        console.log('Login successful:', user);
        onLoginSuccess(user);
      } else {
        // Register
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        const user = await signUp({
          username: email,
          password: password,
          options: {
            userAttributes: {
              name: name,
              email: email
            }
          }
        });
        console.log('Registration successful:', user);
        setError('Registration successful! Please check your email for verification link.');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ 
        background: 'white', 
        padding: '40px', 
        borderRadius: '15px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        maxWidth: '450px',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#333', fontSize: '32px', margin: '0 0 10px 0' }}>
            🌍 WorldSense
          </h1>
          <h2 style={{ color: '#667eea', fontSize: '20px', margin: '0 0 10px 0' }}>
            Global Event Analysis System
          </h2>
          <p style={{ color: '#666', fontSize: '16px', margin: '0' }}>
            Explore global news events and world dynamics
          </p>
        </div>
        
        <div style={{ 
          display: 'flex', 
          marginBottom: '30px', 
          borderBottom: '2px solid #f0f0f0' 
        }}>
          <button 
            style={{
              flex: 1,
              padding: '15px',
              border: 'none',
              background: 'none',
              fontSize: '16px',
              fontWeight: '600',
              color: isLogin ? '#667eea' : '#666',
              cursor: 'pointer',
              borderBottom: isLogin ? '3px solid #667eea' : '3px solid transparent',
              transition: 'all 0.3s ease'
            }}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            style={{
              flex: 1,
              padding: '15px',
              border: 'none',
              background: 'none',
              fontSize: '16px',
              fontWeight: '600',
              color: !isLogin ? '#667eea' : '#666',
              cursor: 'pointer',
              borderBottom: !isLogin ? '3px solid #667eea' : '3px solid transparent',
              transition: 'all 0.3s ease'
            }}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        {error && (
          <div style={{
            background: '#fee',
            color: '#c33',
            border: '1px solid #fcc',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#333', 
              fontWeight: '600', 
              fontSize: '14px' 
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'border-color 0.3s ease',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {!isLogin && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: '#333', 
                fontWeight: '600', 
                fontSize: '14px' 
              }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#333', 
              fontWeight: '600', 
              fontSize: '14px' 
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'border-color 0.3s ease',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {!isLogin && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: '#333', 
                fontWeight: '600', 
                fontSize: '14px' 
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 24px',
              background: loading ? '#ccc' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '20px',
              transition: 'background 0.3s ease'
            }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '20px', 
          paddingTop: '20px', 
          borderTop: '1px solid #f0f0f0' 
        }}>
          <p style={{ color: '#666', fontSize: '14px', margin: '0' }}>
            Test Account: test@worldsense.com / TempPass123!
          </p>
        </div>
      </div>
    </div>
  );
}
