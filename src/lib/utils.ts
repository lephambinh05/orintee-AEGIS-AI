import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export function apiResponse(data: any, status: number = 200) {
  return Response.json(data, {
    status,
    headers: corsHeaders(),
  });
}

export function errorResponse(error: string, code: string, status: number = 400) {
  return Response.json(
    { error, code },
    {
      status,
      headers: corsHeaders(),
    }
  );
}
