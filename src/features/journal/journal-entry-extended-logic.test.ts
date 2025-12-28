import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleNewTransaction } from './journal-entry-extended-logic';

// Create mock functions at module level
const mockFirst = vi.fn();
const mockAdd = vi.fn();
const mockUpdate = vi.fn();
const mockTxGet = vi.fn();
const mockTxAdd = vi.fn();

// Mock the DB with chainable methods
vi.mock('./journal-db-schema', () => {
  const chain = {
    where: vi.fn(() => chain),
    equals: vi.fn(() => chain),
    filter: vi.fn(() => chain),
    first: () => mockFirst(),
    add: (data: any) => mockAdd(data),
    update: (id: any, data: any) => mockUpdate(id, data),
  };
  
  return {
    db: {
      entries: chain,
      txEvents: {
        get: (id: any) => mockTxGet(id),
        add: (data: any) => mockTxAdd(data),
      }
    }
  };
});

describe('Journal Entry Extended Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFirst.mockReset();
    mockAdd.mockReset();
    mockUpdate.mockReset();
    mockTxGet.mockReset();
    mockTxAdd.mockReset();
  });

  it('should ignore duplicate transactions', async () => {
    mockTxGet.mockResolvedValue({ signature: 'sig1' });
    
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

    expect(mockTxAdd).not.toHaveBeenCalled();
    expect(mockAdd).not.toHaveBeenCalled();
  });

  it('should create new entry if no active entry exists', async () => {
    mockTxGet.mockResolvedValue(undefined);
    mockFirst.mockResolvedValue(undefined); // No active entry

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

    expect(mockTxAdd).toHaveBeenCalled();
    expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({
      status: 'active',
      wallet: 'w1',
      tokenMint: 'm1',
      totalBuyAmount: 1
    }));
  });

  it('should update existing active entry', async () => {
    mockTxGet.mockResolvedValue(undefined);
    mockFirst.mockResolvedValue({
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

    expect(mockUpdate).toHaveBeenCalledWith('existing-id', expect.objectContaining({
      totalSellAmount: 1,
      totalSellUsd: 110
    }));
  });
});