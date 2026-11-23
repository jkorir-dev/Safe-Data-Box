import { describe, it, expect } from 'vitest';
import {
  generateKenyanPhone,
  generateFieldValue,
  generateKenyanName,
  generateMpesaCode,
  generateKraPin,
  generateUuid,
  generateDataset,
} from '../utils/kenyanGenerator';

describe('Kenyan Synthetic Data Generator', () => {
  it('generates valid +254 Kenyan phone numbers', () => {
    const phone = generateKenyanPhone();
    expect(phone).toMatch(/^\+254 7\d{2} \d{3} \d{3}$/);
  });

  it('generates realistic 10-character uppercase M-Pesa transaction codes', () => {
    const code = generateMpesaCode();
    expect(code).toMatch(/^S[A-Z0-9]{9}$/);
  });

  it('generates valid KRA PIN format', () => {
    const pin = generateKraPin();
    expect(pin).toMatch(/^A00\d{7}[A-Z]$/);
  });

  it('generates exact row counts and keys for custom schemas', () => {
    const schema = [
      { key: 'id', type: 'relational_id' },
      { key: 'mpesa', type: 'mpesa_code' },
      { key: 'county', type: 'kenyan_county' },
    ];
    const data = generateDataset(schema, 4);
    expect(data).toHaveLength(4);
    expect(Object.keys(data[0])).toEqual(['id', 'mpesa', 'county']);
  });

  it('generates values for each supported field type', () => {
    expect(generateFieldValue('relational_id', 2)).toBe('REL-1003');
    expect(generateFieldValue('uuid')).toMatch(/^usr_[a-z0-9]{8}$/);
    expect(generateUuid()).toMatch(/^usr_[a-z0-9]{8}$/);
    expect(generateKenyanName()).toMatch(/^[A-Za-z]+ [A-Za-z]+$/);
    expect(generateFieldValue('kenyan_name')).toMatch(/^[A-Za-z]+ [A-Za-z]+$/);
    expect(generateFieldValue('kenyan_phone')).toMatch(/^\+254 7\d{2} \d{3} \d{3}$/);
    expect(generateFieldValue('mpesa_code')).toMatch(/^S[A-Z0-9]{9}$/);
    expect(generateFieldValue('kra_pin')).toMatch(/^A00\d{7}[A-Z]$/);
    expect(generateFieldValue('kenyan_county')).toMatch(
      /^(Nairobi|Mombasa|Kisumu|Nakuru|Uasin Gishu|Kiambu|Machakos|Kajiado|Kilifi|Nyeri|Meru|Kakamega|Kericho)$/,
    );
    expect(generateFieldValue('kes_amount')).toBeGreaterThanOrEqual(500);
    expect(generateFieldValue('kes_amount')).toBeLessThanOrEqual(50000);
    expect(generateFieldValue('email')).toMatch(/^[a-z]+\.[a-z]+\d{2}@example\.co\.ke$/);
    expect(typeof generateFieldValue('boolean')).toBe('boolean');
    expect(generateFieldValue('iso_date')).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(generateFieldValue('unknown', 3)).toBe('sample_value_4');
  });

  it('clamps generated dataset size and omits blank keys', () => {
    expect(generateDataset([], 0)).toEqual([{}]);
    expect(generateDataset([], 100)).toHaveLength(50);
    expect(generateDataset([{ key: '  ', type: 'uuid' }], 1)).toEqual([{}]);
  });
});
