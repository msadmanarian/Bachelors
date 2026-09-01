import { describe, expect, it } from 'vitest';
import {
  validateDepositInput,
  validateExpenseInput,
  validateMealQuantity,
  validateMemberInput,
} from '../src/domain/validation';

describe('Domain Validations', () => {
  it('validates member input', () => {
    expect(validateMemberInput('').isValid).toBe(false);
    expect(validateMemberInput('   ').isValid).toBe(false);
    expect(validateMemberInput('R').isValid).toBe(false);
    expect(validateMemberInput('Rahim', '01711223344').isValid).toBe(true);
    expect(validateMemberInput('Karim', 'invalid-phone-abc!').isValid).toBe(false);
  });

  it('validates expense input', () => {
    expect(validateExpenseInput('', 100, 'm1', '2026-09-01').isValid).toBe(false);
    expect(validateExpenseInput('Rice', 0, 'm1', '2026-09-01').isValid).toBe(false);
    expect(validateExpenseInput('Rice', -50, 'm1', '2026-09-01').isValid).toBe(false);
    expect(validateExpenseInput('Rice', 500, '', '2026-09-01').isValid).toBe(false);
    expect(validateExpenseInput('Rice', 500, 'm1', 'invalid-date').isValid).toBe(false);
    expect(validateExpenseInput('Rice 25kg', 1650, 'm1', '2026-09-01').isValid).toBe(true);
  });

  it('validates deposit input', () => {
    expect(validateDepositInput('', 1000, '2026-09-01').isValid).toBe(false);
    expect(validateDepositInput('m1', -100, '2026-09-01').isValid).toBe(false);
    expect(validateDepositInput('m1', 2000, '2026-09-01').isValid).toBe(true);
  });

  it('validates meal quantities', () => {
    expect(validateMealQuantity(0)).toBe(true);
    expect(validateMealQuantity(0.5)).toBe(true);
    expect(validateMealQuantity(1)).toBe(true);
    expect(validateMealQuantity(2.5)).toBe(true);
    expect(validateMealQuantity(-1)).toBe(false);
    expect(validateMealQuantity(15)).toBe(false);
  });
});
