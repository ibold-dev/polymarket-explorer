import { createPublicClient } from '@polymarket/client';

export function getPolymarketClient() {
  return createPublicClient();
}
