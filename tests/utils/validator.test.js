const { validateMemory, sanitizeText } = require('../../src/utils/validator');

describe('validateMemory', () => {
  it('accepts a well-formed memory', () => {
    const result = validateMemory({ from: 'Luka', message: 'A kind word' });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects non-object input', () => {
    expect(validateMemory(null).valid).toBe(false);
    expect(validateMemory(undefined).valid).toBe(false);
    expect(validateMemory('string').valid).toBe(false);
    expect(validateMemory(42).valid).toBe(false);
  });

  it('reports the exact error when from is missing', () => {
    const result = validateMemory({ message: 'Hi' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Name is required');
  });

  it('reports an empty name error when from is whitespace', () => {
    const result = validateMemory({ from: '   ', message: 'Hi' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Name cannot be empty');
  });

  it('reports length error when from is too long', () => {
    const longName = 'a'.repeat(101);
    const result = validateMemory({ from: longName, message: 'Hi' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Name must be less than 100 characters');
  });

  it('rejects non-string from field', () => {
    const result = validateMemory({ from: 123, message: 'Hi' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Name is required');
  });

  it('reports missing message', () => {
    const result = validateMemory({ from: 'Luka' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Message is required');
  });

  it('reports empty message (whitespace only)', () => {
    const result = validateMemory({ from: 'Luka', message: '    ' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Message cannot be empty');
  });

  it('reports message too long', () => {
    const longMsg = 'a'.repeat(10001);
    const result = validateMemory({ from: 'Luka', message: longMsg });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Message must be less than 10,000 characters');
  });

  it('rejects non-string message field', () => {
    const result = validateMemory({ from: 'Luka', message: {} });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Message is required');
  });

  it('accumulates multiple errors at once', () => {
    const result = validateMemory({});
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });

  it('accepts boundary-valid inputs', () => {
    const result = validateMemory({
      from: 'a'.repeat(100),
      message: 'a'.repeat(10000)
    });
    expect(result.valid).toBe(true);
  });
});

describe('sanitizeText', () => {
  it('returns empty string for non-string input', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
    // @ts-expect-error intentional: verifying runtime non-string handling
    expect(sanitizeText(42)).toBe('');
    // @ts-expect-error intentional: verifying runtime non-string handling
    expect(sanitizeText({})).toBe('');
  });

  it('escapes ampersands first to avoid double-encoding', () => {
    expect(sanitizeText('&')).toBe('&amp;');
    expect(sanitizeText('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('escapes HTML angle brackets', () => {
    expect(sanitizeText('<script>')).toBe('&lt;script&gt;');
  });

  it('escapes double quotes', () => {
    expect(sanitizeText('say "hi"')).toBe('say &quot;hi&quot;');
  });

  it('escapes single quotes', () => {
    expect(sanitizeText("it's")).toBe('it&#x27;s');
  });

  it('escapes forward slashes', () => {
    expect(sanitizeText('a/b')).toBe('a&#x2F;b');
  });

  it('escapes a full XSS-ish payload safely', () => {
    const input = `<img src="x" onerror="alert('pwn')" />`;
    const out = sanitizeText(input);
    expect(out).not.toContain('<');
    expect(out).not.toContain('>');
    expect(out).not.toContain('"');
    expect(out).not.toContain("'");
  });

  it('returns empty string for empty string', () => {
    expect(sanitizeText('')).toBe('');
  });
});
