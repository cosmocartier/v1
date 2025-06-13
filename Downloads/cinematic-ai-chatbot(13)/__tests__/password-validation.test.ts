// @ts-nocheck
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { validatePasswordStrength } from '../lib/utils/password-validation';

describe('validatePasswordStrength', () => {
  it('returns strong score and no feedback for valid password', () => {
    const result = validatePasswordStrength('Valid1!A');
    assert.equal(result.score, 5);
    assert.equal(result.feedback.length, 0);
    assert.ok(result.isValid);
  });

  it('returns feedback and correct score for short password', () => {
    const result = validatePasswordStrength('Ab1!');
    assert.equal(result.score, 4);
    assert.ok(result.feedback.includes('Password must be at least 8 characters long'));
    assert.equal(result.isValid, false);
  });

  it('detects missing character types', () => {
    const result = validatePasswordStrength('abcdefgh');
    assert.equal(result.score, 2);
    assert.ok(result.feedback.includes('Include at least one uppercase letter'));
    assert.ok(result.feedback.includes('Include at least one number'));
    assert.ok(result.feedback.includes('Include at least one special character'));
    assert.equal(result.isValid, false);
  });
});
