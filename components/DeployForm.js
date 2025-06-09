import React, { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function DeployForm({ onJobStart }) {
  const [repoUrl, setRepoUrl] = useState('');
  const [target, setTarget] = useState('vercel');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('http://localhost:4000/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, target }),
      });
      const data = await res.json();
      if (res.ok && data.jobId) {
        if (onJobStart) onJobStart(data.jobId);
        setSuccess(true);
        setRepoUrl('');
      } else {
        setError(data.error || 'Failed to start deployment');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.deployCard} onSubmit={handleSubmit}>
      <h3 className={styles.deployTitle}> Deploy Your App</h3>
      <div className={styles.formGroup}>
        <label htmlFor="repoUrl" style={{ color: '#8a94a6' }}>GitHub Repo URL</label>
        <input
          id="repoUrl"
          type="url"
          placeholder="https://github.com/username/repo"
          value={repoUrl}
          onChange={e => setRepoUrl(e.target.value)}
          required
          className={styles.input}
        />
        <small className={styles.helperText}>Enter the public or private repo URL.</small>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="target" style={{ color: '#8a94a6' }}>Deployment Target</label>
        <select
          id="target"
          value={target}
          onChange={e => setTarget(e.target.value)}
          className={styles.input}
        >
          <option value="vercel">Vercel (Next.js)</option>
          <option value="aws">AWS ECS (React)</option>
        </select>
      </div>
      <button
        type="submit"
        className={styles.deployButton}
        disabled={loading}
      >
        {loading ? 'Deploying...' : 'Deploy'}
      </button>
      {error && <div className={styles.errorMsg}>{error}</div>}
      {success && <div className={styles.successMsg}>Deployment started! Check logs below.</div>}
    </form>
  );
} 