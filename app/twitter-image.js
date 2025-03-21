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
          fontSize: 128,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <img
          src={`https://convoanalyzer.com/logo-512x512.png`}
          alt="ConvoAnalyzer Logo"
          width={300}
          height={300}
          style={{ marginBottom: 40 }}
        />
        <div style={{ fontSize: 60, fontWeight: 'bold', color: '#8884d8', marginBottom: 20 }}>
          ConvoAnalyzer
        </div>
        <div style={{ fontSize: 32, color: '#333', textAlign: 'center', maxWidth: '80%' }}>
          Free WhatsApp Chat Analysis Tool
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
