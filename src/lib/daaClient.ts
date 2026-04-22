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
      // DAA API might not require Authorization for public endpoints (based on doc.txt)
      headers: apiKey ? { 'Authorization': apiKey } : {},
      timeout: 10000
    });

    // Cập nhật theo cấu trúc thực tế của API: error, status_code/error_code và message
    const isError = response.data.error === true;
    const statusCode = response.data.status_code || response.data.code || (isError ? response.data.error_code : 200);
    const message = response.data.message || response.data.msg;

    if (isError || (statusCode !== 200 && statusCode !== undefined)) {
      console.error(`[DAA API Details] Error: ${isError}, Status: ${statusCode}, Message: ${message}`);
      throw new Error(message || 'DAA API Error');
    }

    // Nếu data bị null, trả về object rỗng hoặc giá trị mặc định để tránh crash
    return response.data.data || {};
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
