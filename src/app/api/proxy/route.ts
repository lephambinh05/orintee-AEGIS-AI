import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '/public/trade-spot/ticker/24h?symbol=btcusdt';
  const url = `https://api.daathena.com/api/v2${path}`;
  
  console.log(`[Proxy] Calling: ${url}`);
  
  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': 'd8425488094ebe8396ae872ea7137c6e'
      },
      timeout: 10000
    });
    return NextResponse.json({
      status: response.status,
      headers: response.headers,
      data: response.data
    });
  } catch (error: any) {
    return NextResponse.json({
      status: error.response?.status,
      error: error.message,
      data: error.response?.data
    });
  }
}
