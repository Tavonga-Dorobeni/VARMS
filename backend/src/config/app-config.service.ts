import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getDatabaseUrlFromEnv } from './database-url.util';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get databaseUrl(): string {
    return getDatabaseUrlFromEnv({
      ...process.env,
      DATABASE_URL: this.configService.get<string>('DATABASE_URL'),
      DB_HOST: this.configService.get<string>('DB_HOST'),
      DB_PORT: this.configService.get<string>('DB_PORT'),
      DB_NAME: this.configService.get<string>('DB_NAME'),
      DB_USER: this.configService.get<string>('DB_USER'),
      DB_PASSWORD: this.configService.get<string>('DB_PASSWORD'),
    });
  }

  get jwtSecret(): string {
    return this.mustGet('JWT_SECRET');
  }

  get jwtExpiry(): string {
    return this.configService.get<string>('JWT_EXPIRY', '1h');
  }

  get strCashThreshold(): number {
    return this.getNumber('STR_CASH_THRESHOLD', 10000);
  }

  get nomineeWindowDays(): number {
    return this.getNumber('NOMINEE_WINDOW_DAYS', 90);
  }

  get nomineeMinPurchases(): number {
    return this.getNumber('NOMINEE_MIN_PURCHASES', 3);
  }

  get priceDisparityPercent(): number {
    return this.getNumber('PRICE_DISPARITY_PERCENT', 30);
  }

  get highCashVolumeWindowDays(): number {
    return this.getNumber('HIGH_CASH_VOLUME_WINDOW_DAYS', 30);
  }

  get highCashVolumeCount(): number {
    return this.getNumber('HIGH_CASH_VOLUME_COUNT', 5);
  }

  private mustGet(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
  }

  private getNumber(key: string, fallback: number): number {
    const raw = this.configService.get<string>(key);
    return raw ? Number(raw) : fallback;
  }
}
