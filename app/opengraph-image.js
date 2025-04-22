import { ImageResponse } from 'next/server';

export const runtime = 'edge';

export const alt = 'WhatsApp Chat Analyzer - Free Online Chat Analysis Tool';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f7fa',
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
    ),
    {
      ...size,
    }
  );
}
