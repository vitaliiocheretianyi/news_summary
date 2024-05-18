import React, { useState, useEffect } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import '../styles/Login.css'; // Ensure this imports your updated CSS
import { useMutation, useLazyQuery } from '@apollo/client';
import { REGISTER_MUTATION, LOGIN_WITH_USERNAME_MUTATION, LOGIN_WITH_EMAIL_MUTATION, VERIFY_TOKEN_QUERY } from '../mutations/registerAndLogin';
import { useNavigate } from 'react-router-dom';

type FormMode = 'login' | 'register';

const Login: React.FC = () => {
  const [mode, setMode] = useState<FormMode>('login');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [register] = useMutation(REGISTER_MUTATION);
  const [loginWithUsername] = useMutation(LOGIN_WITH_USERNAME_MUTATION);
  const [loginWithEmail] = useMutation(LOGIN_WITH_EMAIL_MUTATION);
  const [verifyToken] = useLazyQuery(VERIFY_TOKEN_QUERY);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log("Verifying token: " + token)
    if (token) {
      verifyToken().then(({ data }) => {
        console.log("Token authentication is: " + data.verifyToken)

        if (data.verifyToken) {
          navigate('/homepage'); // Navigate to homepage if token is valid
        }else{
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
        }
      }).catch(error => {
        console.error('Token verification failed:', error);
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
      });
    }
  }, [navigate, verifyToken]);

  const handleToggleMode = () => {
    setMode(prevMode => {
      const newMode = prevMode === 'login' ? 'register' : 'login';
      setError(''); // Clear error when switching mode
      return newMode;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (mode === 'register') {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address.');
        return;
      }

      // Password validation
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        setError('Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      try {
        const { data } = await register({
          variables: { username, email, password }
        });
        if (data.register.error) {
          setError(data.register.error);
        } else {
          const token = data.register.token;
          localStorage.setItem('token', token);
          navigate('/homepage'); // Navigate to homepage on successful registration
        }
      } catch (error) {
        setError('Registration failed.');
        console.error(error);
      }
    } else {
      try {
        const { data } = emailOrUsername.includes('@')
          ? await loginWithEmail({ variables: { email: emailOrUsername, password } })
          : await loginWithUsername({ variables: { username: emailOrUsername, password } });

        if (data.loginWithEmail?.error || data.loginWithUsername?.error) {
          setError(data.loginWithEmail?.error || data.loginWithUsername?.error);
        } else {
          const token = data.loginWithEmail?.token || data.loginWithUsername?.token;
          localStorage.setItem('token', token);
          navigate('/homepage'); // Navigate to homepage on successful login
        }
      } catch (error) {
        setError('Login failed.');
        console.error(error);
      }
    }
  };

  return (
    <Container className="container">
      <Form onSubmit={handleSubmit} className="form">
        <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
        <Form.Group className="form-group">
          <Form.Control 
            type="text"
            placeholder={mode === 'login' ? 'Email or Username' : 'Username'}
            value={mode === 'login' ? emailOrUsername : username}
            onChange={e => mode === 'login' ? setEmailOrUsername(e.target.value) : setUsername(e.target.value)}
            className="input"
          />
        </Form.Group>
        {mode === 'register' && (
          <Form.Group className="form-group">
            <Form.Control 
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input"
            />
          </Form.Group>
        )}
        <Form.Group className="form-group">
          <Form.Control 
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input"
          />
        </Form.Group>
        {mode === 'register' && (
          <Form.Group className="form-group">
            <Form.Control 
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="input"
            />
          </Form.Group>
        )}
        <Button type="submit" className="button w-100">
          {mode === 'login' ? 'Sign In' : 'Register'}
        </Button>
        {error && <div className="error">{error}</div>}
        <Button className="button w-100 mt-2" onClick={handleToggleMode}>
          {mode === 'login' ? 'Switch to Register' : 'Switch to Login'}
        </Button>
      </Form>
    </Container>
  );
};

export default Login;
