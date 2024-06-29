import React, { useState, useEffect } from 'react';
import { useMutation, useLazyQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { CHANGE_USERNAME, CHANGE_EMAIL, CHANGE_PASSWORD, DELETE_ACCOUNT } from '../mutations/ProfileSettings';
import { VERIFY_TOKEN_QUERY } from '../mutations/registerAndLogin';
import '../styles/ProfileSettings.css';

const ProfileSettings: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ text: string, isError: boolean } | null>(null);
  const [visibleSection, setVisibleSection] = useState<'username' | 'email' | 'password' | null>(null);

  const [changeUsername] = useMutation(CHANGE_USERNAME);
  const [changeEmail] = useMutation(CHANGE_EMAIL);
  const [changePassword] = useMutation(CHANGE_PASSWORD);
  const [deleteAccount] = useMutation(DELETE_ACCOUNT);
  const [verifyToken] = useLazyQuery(VERIFY_TOKEN_QUERY);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken().then(({ data }) => {
        if (!data.verifyToken) {
          localStorage.removeItem('token');
          navigate('/', { replace: true });
        }
      }).catch(() => {
        localStorage.removeItem('token');
        navigate('/', { replace: true });
      });
    } else {
      navigate('/', { replace: true });
    }
  }, [navigate, verifyToken]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await changeUsername({ variables: { username } });
      setMessage({ text: response.data.changeUsername.message, isError: !response.data.changeUsername.success });
    } catch (err: any) {
      console.error(err.message);
      setMessage({ text: 'An error occurred while changing username.', isError: true });
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await changeEmail({ variables: { email } });
      setMessage({ text: response.data.changeEmail.message, isError: !response.data.changeEmail.success });
    } catch (err: any) {
      console.error(err.message);
      setMessage({ text: 'An error occurred while changing email.', isError: true });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'New passwords do not match', isError: true });
      return;
    }
    try {
      const response = await changePassword({ variables: { newPassword } });
      setMessage({ text: response.data.changePassword.message, isError: !response.data.changePassword.success });
    } catch (err: any) {
      console.error(err.message);
      setMessage({ text: 'An error occurred while changing password.', isError: true });
    }
  };

  const handleAccountDeletion = async () => {
    try {
      const response = await deleteAccount();
      setMessage({ text: response.data.deleteAccount.message, isError: !response.data.deleteAccount.success });
      if (response.data.deleteAccount.success) {
        localStorage.removeItem('token');
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      console.error(err.message);
      setMessage({ text: 'An error occurred while deleting the account.', isError: true });
    }
  };

  return (
    <div>
      <header className="profile-settings-header">
        <button className="go-back-button" onClick={handleGoBack}>
          &#x2190;
        </button>
      </header>
      <div className="profile-settings-container">
      <h1>User Settings</h1>
      {message && <p className={`profile-settings-message ${message.isError ? 'error' : 'success'}`}>{message.text}</p>}
      <div className="profile-settings-buttons">
        <button className="profile-settings-button" onClick={() => setVisibleSection('username')}>Change Username</button>
        <button className="profile-settings-button" onClick={() => setVisibleSection('email')}>Change Email</button>
        <button className="profile-settings-button" onClick={() => setVisibleSection('password')}>Change Password</button>
      </div>

      {visibleSection === 'username' && (
        <form className="profile-settings-form" onSubmit={handleUsernameChange}>
          <input
            className="profile-settings-input"
            type="text"
            placeholder="New Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button className="profile-settings-button" type="submit">Confirm Username Change</button>
        </form>
      )}

      {visibleSection === 'email' && (
        <form className="profile-settings-form" onSubmit={handleEmailChange}>
          <input
            className="profile-settings-input"
            type="email"
            placeholder="New Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="profile-settings-button" type="submit">Confirm Email Change</button>
        </form>
      )}

      {visibleSection === 'password' && (
        <form className="profile-settings-form" onSubmit={handlePasswordChange}>
          <input
            className="profile-settings-input"
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            className="profile-settings-input"
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button className="profile-settings-button" type="submit">Confirm Password Change</button>
        </form>
      )}

      <button className="profile-settings-button profile-settings-delete" onClick={handleAccountDeletion}>Delete Account</button>
    </div>
    </div>
  );
};

export default ProfileSettings;