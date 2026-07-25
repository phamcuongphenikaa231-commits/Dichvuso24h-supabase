'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';

// Block this page entirely in production
if (process.env.NODE_ENV === 'production') {
  // The component below will call notFound(), but we also guard at module level
  // for tree-shaking hints.
}

type HealthStatus = 'idle' | 'loading' | 'success' | 'error';

interface HealthResponse {
  success: boolean;
  message: string;
  database?: string;
  sampleCount?: number;
  error?: string;
}

export default function KiemTraSupabasePage() {
  // In production, return 404 immediately
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return <HealthCheckContent />;
}

function HealthCheckContent() {
  const [status, setStatus] = useState<HealthStatus>('loading');
  const [response, setResponse] = useState<HealthResponse | null>(null);

  const fetchHealth = () =>
    fetch('/api/supabase-health')
      .then((res) => res.json())
      .then((data: HealthResponse) => {
        setResponse(data);
        setStatus(data.success ? 'success' : 'error');
      })
      .catch(() => {
        setResponse({
          success: false,
          message: 'Không thể gọi API health check',
          error: 'Fetch failed — kiểm tra console để biết thêm chi tiết.',
        });
        setStatus('error');
      });

  const handleRetry = () => {
    setStatus('loading');
    setResponse(null);
    fetchHealth();
  };

  useEffect(() => {
    // Initial check — status already starts as 'loading',
    // so no synchronous setState is needed here.
    fetchHealth();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🔌 Kiểm tra kết nối Supabase</h1>
        <p style={styles.subtitle}>Trang này chỉ hiển thị trong môi trường development.</p>

        <div style={styles.statusSection}>
          {status === 'loading' && (
            <div style={styles.statusBox}>
              <span style={styles.spinner}>⏳</span>
              <span>Đang kiểm tra kết nối...</span>
            </div>
          )}

          {status === 'success' && response && (
            <div style={{ ...styles.statusBox, ...styles.successBox }}>
              <span style={styles.icon}>✅</span>
              <div>
                <p style={styles.statusLabel}>Kết nối thành công</p>
                <p style={styles.statusDetail}>Database: {response.database}</p>
                <p style={styles.statusDetail}>
                  Số bản ghi mẫu: {response.sampleCount}
                </p>
              </div>
            </div>
          )}

          {status === 'error' && response && (
            <div style={{ ...styles.statusBox, ...styles.errorBox }}>
              <span style={styles.icon}>❌</span>
              <div>
                <p style={styles.statusLabel}>Kết nối thất bại</p>
                <p style={styles.statusDetail}>{response.error}</p>
              </div>
            </div>
          )}
        </div>

        <button onClick={handleRetry} style={styles.button} disabled={status === 'loading'}>
          {status === 'loading' ? 'Đang kiểm tra...' : '🔄 Kiểm tra lại'}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Inline styles — keeps this dev-only page self-contained           */
/* ------------------------------------------------------------------ */

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f172a',
    padding: '1rem',
  },
  card: {
    background: '#1e293b',
    borderRadius: '1rem',
    padding: '2.5rem',
    maxWidth: '480px',
    width: '100%',
    boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
    color: '#e2e8f0',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
    color: '#f1f5f9',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    marginBottom: '1.5rem',
  },
  statusSection: {
    marginBottom: '1.5rem',
  },
  statusBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '1rem',
    borderRadius: '0.75rem',
    background: '#334155',
  },
  successBox: {
    background: '#064e3b',
    border: '1px solid #059669',
  },
  errorBox: {
    background: '#7f1d1d',
    border: '1px solid #dc2626',
  },
  spinner: {
    fontSize: '1.25rem',
  },
  icon: {
    fontSize: '1.25rem',
    flexShrink: 0,
  },
  statusLabel: {
    fontWeight: 600,
    fontSize: '1rem',
    margin: 0,
  },
  statusDetail: {
    fontSize: '0.85rem',
    color: '#cbd5e1',
    margin: '0.25rem 0 0 0',
  },
  button: {
    width: '100%',
    padding: '0.75rem 1rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    background: '#3b82f6',
    color: '#fff',
    transition: 'background 0.2s',
  },
};
