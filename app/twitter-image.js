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
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src="https://convoanalyzer.com/banner.png"
          alt="WhatsApp Chat Analyzer"
          width={1200}
          height={630}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
