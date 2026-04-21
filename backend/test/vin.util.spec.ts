import { isValidVin } from '../src/common/utils/vin.util';

describe('isValidVin', () => {
  it('accepts a valid VIN', () => {
    expect(isValidVin('JH4KA8260MC000001')).toBe(true);
  });

  it('rejects invalid characters', () => {
    expect(isValidVin('JH4IA8260MC000001')).toBe(false);
  });
});
