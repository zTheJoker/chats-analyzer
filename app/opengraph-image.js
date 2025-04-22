import { ImageResponse } from 'next/server';

export const runtime = 'edge';

export const alt = 'WhatsApp Chat Analyzer - Free Online Chat Analysis Tool';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  // Use the public banner.png directly
  return new ImageResponse(
    (
      <div
        style={{
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to right, #f5f7fa, #c3cfe2)',
            padding: '40px',
          }}
        >
          <h1 style={{ fontSize: '60px', color: '#4A148C', margin: '0 0 20px' }}>
            WhatsApp Chat Analyzer
          </h1>
          <p style={{ fontSize: '32px', color: '#333', textAlign: 'center' }}>
            Private, instant insights from your conversations
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
