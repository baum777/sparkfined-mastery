import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleNewTransaction } from './journal-entry-extended-logic';
import { db } from './journal-db-schema';

// Create a chainable mock helper
const createChainableMock = (finalValue: any) => {
  const chain = {
    where: vi.fn().mockReturnThis(),
    equals: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
    first: vi.fn().mockResolvedValue(finalValue),
    add: vi.fn(),
    update: vi.fn(),
  };
  return chain;
};

let entriesMock: ReturnType<typeof createChainableMock>;
let txEventsMock: { get: ReturnType<typeof vi.fn>; add: ReturnType<typeof vi.fn> };

// Mock the DB
vi.mock('./journal-db-schema', () => ({
  db: {
    entries: {
      where: vi.fn(() => entriesMock),
      equals: vi.fn(() => entriesMock),
      filter: vi.fn(() => entriesMock),
      first: vi.fn(() => entriesMock.first()),
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
    entriesMock = createChainableMock(undefined);
    txEventsMock = { get: vi.fn(), add: vi.fn() };
    
    // Re-wire mocks
    (db.entries.where as any).mockReturnValue(entriesMock);
    (db.entries.add as any) = entriesMock.add;
    (db.entries.update as any) = entriesMock.update;
    (db.txEvents.get as any) = txEventsMock.get;
    (db.txEvents.add as any) = txEventsMock.add;
  });

  it('should ignore duplicate transactions', async () => {
    txEventsMock.get.mockResolvedValue({ signature: 'sig1' });
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
    expect(entriesMock.add).not.toHaveBeenCalled();
  });

  it('should create new entry if no active entry exists', async () => {
    (db.txEvents.get as any).mockResolvedValue(undefined);
    entriesMock.first.mockResolvedValue(undefined);

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
    entriesMock.first.mockResolvedValue({
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
