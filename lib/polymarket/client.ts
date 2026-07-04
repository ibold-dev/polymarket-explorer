import { createPublicClient } from '@polymarket/client';
import { PolymarketClient } from '../polymarket-sdk/client';

export function getPolymarketClient(): any {
  const sdk = createPublicClient();
  const newClient = new PolymarketClient();

  return {
    sdk,
    newClient,
  };
}
