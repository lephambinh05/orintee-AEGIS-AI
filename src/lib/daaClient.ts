import axios, { AxiosError } from 'axios';

export class DaaAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DaaAuthError';
  }
}

export class DaaRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DaaRateLimitError';
  }
}

export class DaaServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DaaServerError';
  }
}

const DAA_BASE_URL = process.env.DAA_BASE_URL || 'https://api.daathena.com/api/v2';

export async function daaFetch<T>(path: string): Promise<T> {
  const apiKey = process.env.DAA_API_KEY;
  
  try {
    const response = await axios.get(`${DAA_BASE_URL}${path}`, {
      headers: {
        'Authorization': apiKey
      },
      timeout: 10000
    });

    if (response.data.code !== 200) {
      throw new Error(response.data.msg || 'DAA API Error');
    }

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;

      if (status === 401) {
        throw new DaaAuthError('Invalid DAA API Key');
      }
      if (status === 429) {
        throw new DaaRateLimitError('DAA API Rate Limit Exceeded');
      }
      if (status && status >= 500) {
        throw new DaaServerError('DAA Server Error');
      }
    }
    throw error;
  }
}
