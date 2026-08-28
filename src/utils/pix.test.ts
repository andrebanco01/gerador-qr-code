import { describe, it, expect } from 'vitest';
import { generatePixPayload, crc16 } from './pix';

describe('crc16', () => {
  it('should compute CRC16-CCITT for known string', () => {
    const result = crc16('123456789');
    expect(result).toMatch(/^[0-9A-F]{4}$/);
  });

  it('should return a 4-character uppercase hex string', () => {
    const result = crc16('test');
    expect(result).toHaveLength(4);
    expect(result).toBe(result.toUpperCase());
  });

  it('should be deterministic (same input → same output)', () => {
    const a = crc16('hello world');
    const b = crc16('hello world');
    expect(a).toBe(b);
  });

  it('should produce different checksums for different inputs', () => {
    const a = crc16('abc');
    const b = crc16('xyz');
    expect(a).not.toBe(b);
  });
});

describe('generatePixPayload', () => {
  it('should generate a valid PIX payload with minimal required fields', () => {
    const payload = generatePixPayload({
      key: 'user@email.com',
      name: 'Joao da Silva',
      city: 'SAO PAULO',
    });

    expect(payload).toBeTruthy();
    expect(typeof payload).toBe('string');
    expect(payload).toMatch(/^000201/); // Format indicator
    expect(payload).toContain('br.gov.bcb.pix');
    expect(payload).toContain('user@email.com');
    expect(payload).toContain('JOAO DA SILVA');
    expect(payload).toContain('SAO PAULO');
  });

  it('should use default values for missing optional fields', () => {
    const payload = generatePixPayload({
      key: '12345678900',
      name: 'Empresa Teste',
      city: 'RIO DE JANEIRO',
    });

    // Should include default txid ***
    expect(payload).toContain('***');
    // Should end with CRC16 checksum (4 hex chars after 6304)
    expect(payload).toMatch(/6304[0-9A-F]{4}$/);
  });

  it('should include amount when provided', () => {
    const payloadWithAmount = generatePixPayload({
      key: 'test@email.com',
      name: 'Loja',
      city: 'SP',
      amount: '49.90',
    });

    expect(payloadWithAmount).toContain('49.90');
  });

  it('should not include amount field when amount is empty', () => {
    const payloadNoAmount = generatePixPayload({
      key: 'test@email.com',
      name: 'Loja',
      city: 'SP',
    });

    // Field 54 (Amount) should not be present
    expect(payloadNoAmount).not.toMatch(/54\d{2}/);
  });

  it('should strip accents from name and city', () => {
    const payload = generatePixPayload({
      key: 'test@email.com',
      name: 'São Paulo Comércio',
      city: 'São Paulo',
    });

    // Accents should be removed
    expect(payload).toContain('SAO PAULO COMERCIO');
    expect(payload).toContain('SAO PAULO');
    expect(payload).not.toContain('ã');
    expect(payload).not.toContain('é');
  });

  it('should truncate name to 25 characters', () => {
    const longName = 'A'.repeat(30);
    const payload = generatePixPayload({
      key: 'test@email.com',
      name: longName,
      city: 'SP',
    });

    // Name should be truncated
    expect(payload).toContain('A'.repeat(25));
    expect(payload).not.toContain('A'.repeat(26));
  });

  it('should truncate city to 15 characters', () => {
    const longCity = 'B'.repeat(20);
    const payload = generatePixPayload({
      key: 'test@email.com',
      name: 'Test',
      city: longCity,
    });

    expect(payload).toContain('B'.repeat(15));
    expect(payload).not.toContain('B'.repeat(16));
  });

  it('should include custom txid when provided', () => {
    const payload = generatePixPayload({
      key: 'test@email.com',
      name: 'Test',
      city: 'SP',
      txid: 'PEDIDO123',
    });

    expect(payload).toContain('PEDIDO123');
  });

  it('should use default txid *** when txid is empty', () => {
    const payload = generatePixPayload({
      key: 'test@email.com',
      name: 'Test',
      city: 'SP',
      txid: '',
    });

    expect(payload).toContain('***');
  });

  it('should produce a payload longer than 100 characters', () => {
    const payload = generatePixPayload({
      key: 'user@email.com',
      name: 'Nome Completo',
      city: 'Sao Paulo',
    });

    expect(payload.length).toBeGreaterThan(100);
  });

  it('should have valid EMV structure (each field has ID + length + value)', () => {
    const payload = generatePixPayload({
      key: 'test@email.com',
      name: 'Test',
      city: 'SP',
    });

    // The payload should start with format indicator
    expect(payload.startsWith('000201')).toBe(true);

    // Should contain merchant account info (tag 26)
    expect(payload).toContain('26');
    expect(payload).toContain('br.gov.bcb.pix');

    // Should contain country code BR (tag 58)
    expect(payload).toContain('5802BR');

    // Should end with CRC16
    expect(payload).toMatch(/6304[0-9A-F]{4}$/);
  });

  it('should generate the same payload for the same inputs', () => {
    const params = {
      key: 'consistent@email.com',
      name: 'Consistent Name',
      city: 'Consistent City',
      amount: '10.00',
      txid: 'TX123',
    };

    const a = generatePixPayload(params);
    const b = generatePixPayload(params);
    expect(a).toBe(b);
  });

  it('should handle edge case: empty name defaults to RECEBEDOR', () => {
    const payload = generatePixPayload({
      key: 'test@email.com',
      name: '',
      city: 'SP',
    });

    expect(payload).toContain('RECEBEDOR');
  });

  it('should handle edge case: empty city defaults to SAO PAULO', () => {
    const payload = generatePixPayload({
      key: 'test@email.com',
      name: 'Test',
      city: '',
    });

    expect(payload).toContain('SAO PAULO');
  });

  it('should produce valid checksum (CRC16 matches last 4 chars)', () => {
    const payload = generatePixPayload({
      key: 'test@email.com',
      name: 'Test',
      city: 'SP',
    });

    // Everything before the last 4 chars
    const payloadWithoutCrc = payload.slice(0, -4);
    const appendedCrc = payload.slice(-4);

    // CRC16 of payload without CRC should match
    const computedCrc = crc16(payloadWithoutCrc);
    expect(computedCrc).toBe(appendedCrc);
  });
});
