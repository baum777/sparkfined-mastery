import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleNewTransaction } from './journal-entry-extended-logic';
import { db } from './journal-db-schema';

// Mock the DB
vi.mock('./journal-db-schema', () => ({
  db: {
    entries: {
      where: vi.fn().mockReturnThis(),
      equals: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      first: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
    },
    txEvents: {
      get: vi.fn(),
      add: vi.fn(),
    }
  }
}));

describe('Journal Entry Extended Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should ignore duplicate transactions', async () => {
    (db.txEvents.get as any).mockResolvedValue({ signature: 'sig1' });
    
    await handleNewTransaction({
      signature: 'sig1',
      wallet: 'w1',
      blockTime: 1000,
      tokenMint: 'm1',
      type: 'BUY',
      amountToken: 1,
      amountUsd: 100,
      priceUsd: 100,
      dex: null
    });

    expect(db.txEvents.add).not.toHaveBeenCalled();
    expect(db.entries.add).not.toHaveBeenCalled();
  });

  it('should create new entry if no active entry exists', async () => {
    (db.txEvents.get as any).mockResolvedValue(undefined);
    (db.entries.first as any).mockResolvedValue(undefined); // No active entry

    await handleNewTransaction({
      signature: 'sig2',
      wallet: 'w1',
      blockTime: 1000,
      tokenMint: 'm1',
      type: 'BUY',
      amountToken: 1,
      amountUsd: 100,
      priceUsd: 100,
      dex: null
    });

    expect(db.txEvents.add).toHaveBeenCalled();
    expect(db.entries.add).toHaveBeenCalledWith(expect.objectContaining({
      status: 'active',
      wallet: 'w1',
      tokenMint: 'm1',
      totalBuyAmount: 1
    }));
  });

  it('should update existing active entry', async () => {
    (db.txEvents.get as any).mockResolvedValue(undefined);
    (db.entries.first as any).mockResolvedValue({
      id: 'existing-id',
      status: 'active',
      wallet: 'w1',
      tokenMint: 'm1',
      totalBuyAmount: 1,
      totalBuyUsd: 100,
      totalSellAmount: 0,
      totalSellUsd: 0,
      txSignatures: ['prev-sig'],
      expiryTime: 9999999999 // Future
    });

    await handleNewTransaction({
      signature: 'sig3',
      wallet: 'w1',
      blockTime: 2000,
      tokenMint: 'm1',
      type: 'SELL',
      amountToken: 1,
      amountUsd: 110,
      priceUsd: 110,
      dex: null
    });

    expect(db.entries.update).toHaveBeenCalledWith('existing-id', expect.objectContaining({
      totalSellAmount: 1,
      totalSellUsd: 110
    }));
  });
});
