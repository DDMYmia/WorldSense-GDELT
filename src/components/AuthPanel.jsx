import React, { useState, useEffect } from 'react';
import { signIn, signUp, signOut, getCurrentUser } from 'aws-amplify/auth';
import './AuthPanel.css';

export default function AuthPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuthState();
  }, []);

  async function checkAuthState() {
    try {
      const user = await getCurrentUser();
      setUser(user);
      setIsLoggedIn(true);
    } catch (error) {
      setIsLoggedIn(false);
      setUser(null);
    }
  }

  async function handleSignIn(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn({ username: email, password });
      setUser(result);
      setIsLoggedIn(true);
      setEmail('');
      setPassword('');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name
          }
        }
      });
      setError('Registration successful! Please check your email to confirm.');
      setIsSignUp(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      setIsLoggedIn(false);
      setUser(null);
      setEmail('');
      setPassword('');
      setName('');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  if (isLoggedIn && user) {
    return (
      <div className="auth-panel-fixed">
        <div className="auth-header">
          <h4>🌍 WorldSense</h4>
        </div>
        <div className="auth-content">
          <div className="welcome-message">
            Welcome, {user.attributes.name || user.attributes.email}!
          </div>
          <button
            onClick={handleSignOut}
            className="auth-button auth-button-signout"
            disabled={loading}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-panel-fixed">
      <div className="auth-header">
        <h4>🌍 WorldSense</h4>
      </div>
      <div className="auth-content">
        {isSignUp && (
          <div className="auth-field">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="auth-input"
            />
          </div>
        )}

        <div className="auth-row">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
          />
        </div>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-buttons">
          <button
            onClick={handleSignIn}
            className="auth-button auth-button-primary"
            disabled={loading || !email || !password}
          >
            {loading ? '...' : 'Sign In'}
          </button>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="auth-button auth-button-secondary"
            disabled={loading}
          >
            {isSignUp ? 'Back to Sign In' : 'Sign Up'}
          </button>
        </div>

        {isSignUp && (
          <div className="auth-signup-note">
            <button
              onClick={handleSignUp}
              className="auth-button auth-button-signup"
              disabled={loading || !email || !password || !name}
            >
              {loading ? '...' : 'Register'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
