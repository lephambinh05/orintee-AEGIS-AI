import { NextRequest } from 'next/server';
import { apiResponse, errorResponse } from '@/lib/utils';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const txHash = searchParams.get('txHash');

  if (!txHash || !/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
    return errorResponse('Invalid transaction hash', 'INVALID_TX', 400);
  }

  try {
    // 1. Call Base Sepolia RPC
    const response = await axios.post('https://sepolia.base.org', {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getTransactionReceipt',
      params: [txHash]
    }, {
      timeout: 5000
    });

    const receipt = response.data.result;

    if (!receipt) {
      return apiResponse({
        exists: false,
        status: 'not_found'
      });
    }

    // status: 0x1 is success, 0x0 is failure
    const status = receipt.status === '0x1' ? 'success' : 'failed';

    return apiResponse({
      exists: true,
      status
    });
  } catch (error) {
    console.error('[API Verify] RPC Error:', (error as Error).message);

    // If fetch failed, return pending or internal error
    return apiResponse({
      exists: false,
      status: 'pending',
      warning: 'RPC check failed, transaction might still be processing'
    });
  }
}
