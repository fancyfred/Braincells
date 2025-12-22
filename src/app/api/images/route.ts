import { NextResponse } from 'next/server';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || 'brain neuron';

  if (!UNSPLASH_ACCESS_KEY) {
    return NextResponse.json({ 
      url: null, 
      useIcon: true,
      error: 'Unsplash API key not configured' 
    });
  }

  try {
    // Fetch multiple images to get more variety
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=10&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Unsplash API error');
    }

    const data = await response.json();
    const results = data.results || [];

    if (results.length === 0) {
      return NextResponse.json({ url: null });
    }

    // Randomly select one of the results for variety
    const randomIndex = Math.floor(Math.random() * results.length);
    const image = results[randomIndex];

    return NextResponse.json({
      url: image.urls.regular,
      alt: image.alt_description || query,
      credit: image.user.name,
      useIcon: false,
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json({ 
      url: null, 
      useIcon: true,
      error: 'Failed to fetch image' 
    });
  }
}

