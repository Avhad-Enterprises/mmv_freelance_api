export function validateUrlFormatWithReason(input: string): { valid: boolean; reason?: string } {
    for (let i = 0; i < input.length; i++) {
      const char = input[i];
  
      switch (true) {
        case /[A-Z]/.test(char):
          return { valid: false, reason: `Uppercase letter '${char}' not allowed` };
  
        case char === ' ':
          return { valid: false, reason: `Space not allowed in URL at position ${i}` };
  
        case char === '_':
          return { valid: false, reason: `Underscore '_' not allowed` };
  
        case /[^a-z0-9\-]/.test(char):
          return { valid: false, reason: `Invalid character '${char}' at position ${i}` };
      }
    }
  
    // ✅ Extra rules
    if (/^-|-$/.test(input)) {
      return { valid: false, reason: 'URL cannot start or end with a dash (-)' };
    }
  
    if (/--/.test(input)) {
      return { valid: false, reason: 'URL cannot contain multiple consecutive dashes (--)' };
    }
  
    if (!input || input.replace(/-/g, '').length === 0) {
      return { valid: false, reason: 'URL must contain letters or numbers' };
    }
  
    return { valid: true };
  }
  