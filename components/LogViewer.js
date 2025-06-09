import React, { useEffect, useRef, useState } from 'react';
import styles from '../styles/Home.module.css';

export default function LogViewer({ jobId, githubRepo, githubBranch = 'main' }) {
  const [logs, setLogs] = useState([]);
  const [connected, setConnected] = useState(false);
  const [showGithubLogs, setShowGithubLogs] = useState(false);
  const [githubLogs, setGithubLogs] = useState('');
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState('');
  const logEndRef = useRef(null);

  // Local logs (from deploy.sh)
  useEffect(() => {
    if (!jobId) return;
    setLogs([]);
    setConnected(false);
    setShowGithubLogs(false);
    const eventSource = new EventSource(`http://localhost:4000/logs?jobId=${jobId}`);
    eventSource.onopen = () => setConnected(true);
    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setLogs(logs => [...logs, data.line]);
    };
    eventSource.onerror = () => {
      setConnected(false);
      eventSource.close();
    };
    return () => eventSource.close();
  }, [jobId]);

  // Scroll to bottom on new logs
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, githubLogs, showGithubLogs]);

  // Fetch GitHub Actions logs
  const fetchGithubLogs = async () => {
    setGithubLoading(true);
    setGithubError('');
    setShowGithubLogs(false);
    try {
      const res = await fetch(`http://localhost:4000/github-logs?repo=${githubRepo}&branch=${githubBranch}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch GitHub logs');
      }
      const text = await res.text();
      setGithubLogs(text);
      setShowGithubLogs(true);
    } catch (err) {
      setGithubError(err.message);
    } finally {
      setGithubLoading(false);
    }
  };

  if (!jobId && !githubRepo) return null;

  return (
    <div className={styles.logViewerBox}>
      <div className={styles.logHeader}>
        <span>
          {showGithubLogs ? 'GitHub Actions Logs' : 'Deployment Logs'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {githubRepo && (
            <button
              className={styles.deployButton}
              style={{ fontSize: '0.95rem', padding: '0.4rem 1rem', marginRight: 8 }}
              onClick={fetchGithubLogs}
              disabled={githubLoading}
            >
              {githubLoading ? 'Fetching GitHub Logs...' : 'Show GitHub Actions Logs'}
            </button>
          )}
          {showGithubLogs && (
            <button
              className={styles.deployButton}
              style={{ fontSize: '0.95rem', padding: '0.4rem 1rem', background: '#23283a', color: '#4f8cff', border: '1px solid #4f8cff' }}
              onClick={() => setShowGithubLogs(false)}
            >
              Show Local Logs
            </button>
          )}
          {(!showGithubLogs && jobId) && (
            connected ? (
              <span className={styles.connectedDot} title="Connected" />
            ) : (
              <span className={styles.disconnectedDot} title="Disconnected" />
            )
          )}
        </div>
      </div>
      <div className={styles.logContent}>
        {showGithubLogs ? (
          githubError ? (
            <div className={styles.errorMsg}>{githubError}</div>
          ) : (
            <pre style={{ color: '#38e8ff', background: 'none', margin: 0 }}>{githubLogs}</pre>
          )
        ) : (
          logs.map((line, i) => <div key={i}>{line}</div>)
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
} 