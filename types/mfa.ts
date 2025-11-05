// MFA (Multi-Factor Authentication) Types

export interface MFASetupResponse {
  secret: string;
  qr_code_data_url: string; // Base64 encoded QR code image (data URL)
  backup_codes: string[];
}

export interface MFAStatus {
  enabled: boolean;
  verified_at?: string;
  backup_codes_count?: number;
}

export interface MFASetupRequest {
  password: string;
}

export interface MFAVerifySetupRequest {
  code: string;
}

export interface MFADisableRequest {
  password: string;
  code: string;
}

export interface MFARegenerateBackupCodesRequest {
  password: string;
}

export interface MFARegenerateBackupCodesResponse {
  backup_codes: string[];
}

export interface MFALoginRequest {
  email: string;
  password: string;
  code: string;
  backup_code?: boolean;
}
