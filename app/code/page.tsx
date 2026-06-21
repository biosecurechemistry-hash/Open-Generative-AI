"use client";
import { useState, useEffect } from 'react';

export default function CodeMonitor() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCode() {
      try {
        // Routed directly to the primary Director-Server Backend
        const apiUri = 'http://localhost:3002'; 
        const res = await fetch(`${apiUri}/api/code/raw`);
        
        if (!res.ok) throw new Error(`Backend rejected connection: ${res.status}`);
        
        const data = await res.json();
        
        if (Array.isArray(data)) {
            setLogs(data);
        } else {
            setError('Received malformed data from the matrix. Ensure backend is returning an array.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCode();
  }, []);

  return (
    <div style={{ padding: '40px', backgroundColor: '#050505', color: '#10b981', minHeight: '100vh', fontFamily: 'monospace' }}>
      <header style={{ borderBottom: '1px solid #064e3b', paddingBottom: '20px', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0, letterSpacing: '-0.05em' }}>/// DEEP WORKFLOW EXECUTION STREAM</h1>
        <p style={{ color: '#047857', margin: '5px 0 0 0', fontSize: '1.1rem' }}>Monitoring Entire Database Row | Port 3002 Direct</p>
      </header>
      
      {loading && <p style={{ color: '#34d399', animation: 'pulse 2s infinite' }}>Intercepting workflow packets from Port 3002...</p>}
      
      {error && <div style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', padding: '15px', borderRadius: '4px', border: '1px solid #ef4444' }}><strong>System Alert:</strong> {error}</div>}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '80vh', overflowY: 'auto', paddingRight: '10px' }}>
        {Array.isArray(logs) && logs.map((log) => (
          <div key={log.id} style={{ backgroundColor: '#064e3b15', border: '1px solid #064e3b', padding: '20px', borderRadius: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399', marginBottom: '15px', fontSize: '0.9rem', borderBottom: '1px dashed #064e3b', paddingBottom: '10px' }}>
              <span>Execution ID: {log.id} | {log.title || 'Agent Payload'}</span>
              <span style={{ backgroundColor: '#064e3b', color: '#fff', padding: '2px 8px', borderRadius: '2px' }}>{log.status || 'LOGGED'}</span>
            </div>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#a7f3d0', fontSize: '0.9rem', lineHeight: '1.5' }}>
              {JSON.stringify(log, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
