'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: 'linear-gradient(180deg, #fff, #f7f3ef)',
          color: '#2f2a25',
          fontFamily: 'var(--font-body), system-ui, sans-serif',
        }}
      >
        <main
          style={{
            maxWidth: 560,
            padding: '32px 24px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              margin: '0 0 12px',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#8a7768',
            }}
          >
            Markkët
          </p>
          <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(2rem, 6vw, 3rem)', lineHeight: 1.05 }}>
            Something went wrong.
          </h1>
          <p style={{ margin: '0 0 24px', fontSize: '1rem', lineHeight: 1.6, color: '#61564e' }}>
            The page could not finish rendering. Try again, or return to the home page.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                border: 'none',
                borderRadius: 999,
                padding: '12px 18px',
                background: '#e4007c',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                borderRadius: 999,
                padding: '12px 18px',
                border: '1px solid #d8cdc4',
                color: '#2f2a25',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              Home
            </a>
          </div>
          {process.env.NODE_ENV === 'development' ? (
            <pre
              style={{
                marginTop: 24,
                padding: 16,
                textAlign: 'left',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                background: 'rgba(0,0,0,0.04)',
                borderRadius: 16,
                color: '#6b5d53',
                fontSize: 12,
              }}
            >
              {error.message}
              {error.digest ? `\n\nDigest: ${error.digest}` : ''}
            </pre>
          ) : null}
        </main>
      </body>
    </html>
  );
}