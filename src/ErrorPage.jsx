import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ErrorPage() {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/homepage');
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Oops! Page Not Found</h1>
      <p style={styles.message}>The page you're looking for doesn't exist.</p>
      <button style={styles.button} onClick={handleBackToHome}>
        Back to Homepage
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',  
    backgroundColor: '#242424',
    color: '#fff',
    textAlign: 'center',
    marginTop: 'auto', 
    marginBottom: 'auto',
  },
  heading: {
    fontSize: '2.5rem',
    marginBottom: '20px',
  },
  message: {
    fontSize: '1.2rem',
    marginBottom: '40px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '1rem',
    backgroundColor: '#646cff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};
