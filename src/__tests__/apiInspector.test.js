import { afterEach, describe, it, expect, vi } from 'vitest';
import { cloneSchemaFromUrl } from '../services/apiInspector';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('External REST API Schema Inspector', () => {
  it('throws an error for invalid non-http URLs', async () => {
    await expect(cloneSchemaFromUrl('invalid-url')).rejects.toThrow(
      'Please enter a valid HTTP or HTTPS API endpoint URL.'
    );
  });

  it('clones JSON keys and infers Kenyan field types from live API payload', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        { id: 1, name: 'Wanjiku Kamau', phone: '+254712345678', email: 'w@test.co.ke', active: true },
      ]),
    }));

    const fields = await cloneSchemaFromUrl('https://example.com');
    expect(fields).toEqual([
      { key: 'id', type: 'relational_id' },
      { key: 'name', type: 'kenyan_name' },
      { key: 'phone', type: 'kenyan_phone' },
      { key: 'email', type: 'email' },
      { key: 'active', type: 'boolean' },
    ]);
  });

  it('infers field types from a data envelope and excludes nested properties', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: [{
          mobile: '0712345678',
          receipt: 'ABC',
          kra_pin: 'A001234567B',
          county: 'Nairobi',
          balance: 100,
          email_address: 'sample@example.com',
          account_id: 1,
          username: 'sample',
          created: '2025-01-02T00:00:00Z',
          misc: 'value',
          empty: null,
          nested: { hidden: true },
        }],
      }),
    }));

    await expect(cloneSchemaFromUrl('https://example.com/data')).resolves.toEqual([
      { key: 'mobile', type: 'kenyan_phone' },
      { key: 'receipt', type: 'mpesa_code' },
      { key: 'kra_pin', type: 'kra_pin' },
      { key: 'county', type: 'kenyan_county' },
      { key: 'balance', type: 'kes_amount' },
      { key: 'email_address', type: 'email' },
      { key: 'account_id', type: 'relational_id' },
      { key: 'username', type: 'kenyan_name' },
      { key: 'created', type: 'iso_date' },
      { key: 'misc', type: 'uuid' },
      { key: 'empty', type: 'uuid' },
    ]);
  });

  it('reads result envelopes when data is absent or empty', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [], results: [{ price: 250 }] }),
    }));

    await expect(cloneSchemaFromUrl('https://example.com/results')).resolves.toEqual([
      { key: 'price', type: 'kes_amount' },
    ]);
  });

  it('rejects unsuccessful HTTP responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    await expect(cloneSchemaFromUrl('https://example.com')).rejects.toThrow(
      'API request failed with status 503.',
    );
  });

  it.each([null, 'not-an-object'])(
    'rejects payloads without a sample object',
    async (payload) => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(payload),
      }));

      await expect(cloneSchemaFromUrl('https://example.com')).rejects.toThrow(
        'Could not find a valid JSON object structure in that API response.',
      );
    },
  );

  it('rejects sample objects that contain no primitive fields', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ nested: { value: true } }),
    }));

    await expect(cloneSchemaFromUrl('https://example.com')).rejects.toThrow(
      'No primitive JSON fields found to import.',
    );
  });
});
