import React, { useEffect, useRef, useState } from 'react';
import styles from '../styles/Home.module.css';

export default function LogViewer({ jobId }) {
  const [logs, setLogs] = useState([]);
  const [connected, setConnected] = useState(false);
  const logEndRef = useRef(null);

  useEffect(() => {
    if (!jobId) return;
    setLogs([]);
    setConnected(false);
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

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  if (!jobId) return null;

  return (
    <div className={styles.logViewerBox}>
      <div className={styles.logHeader}>
        <span>Deployment Logs</span>
        {connected ? (
          <span className={styles.connectedDot} title="Connected" />
        ) : (
          <span className={styles.disconnectedDot} title="Disconnected" />
        )}
      </div>
      <div className={styles.logContent}>
        {logs.map((line, i) => <div key={i}>{line}</div>)}
        <div ref={logEndRef} />
      </div>
    </div>
  );
} 