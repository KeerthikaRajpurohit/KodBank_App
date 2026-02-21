import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import api from '../api';
import './UserDashboard.css';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const triggerPartyPopper = () => {
    const duration = 2500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD700', '#F4C430', '#FFA500', '#FFFFFF'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFD700', '#F4C430', '#FFA500', '#FFFFFF'],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const handleCheckBalance = async () => {
    setError('');
    setLoading(true);
    setBalance(null);
    try {
      const { data } = await api.get('/api/balance');
      setBalance(data.balance);
      triggerPartyPopper();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch balance');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = 'token=; path=/; max-age=0';
    navigate('/login');
  };

  return (
    <div className="dashboard-card">
      <h2>Your Dashboard</h2>
      <p className="dashboard-subtitle">Manage your KodBank account</p>

      <button
        className="kod-btn kod-btn-balance"
        onClick={handleCheckBalance}
        disabled={loading}
      >
        {loading ? 'Checking...' : 'Check Balance'}
      </button>

      {error && <p className="dashboard-error">{error}</p>}

      {balance !== null && (
        <div className="balance-result">
          <div className="balance-message">
            Your balance is: ₹{Number(balance).toLocaleString('en-IN')}
          </div>
          <div className="balance-celebration" aria-hidden="true" />
        </div>
      )}

      <button className="kod-btn kod-btn-outline" onClick={handleLogout}>
        Log Out
      </button>
    </div>
  );
}
