import type { JwtService } from '@nestjs/jwt';

export type AuthTokenType = 'access' | 'refresh';

export interface AuthTokenPayload {
  sub?: string;
  tokenType?: AuthTokenType;
}

export function getTokenSubject(jwtService: JwtService, token: string, tokenType: AuthTokenType): string | null {
  try {
    const payload = jwtService.verify<AuthTokenPayload>(token);
    if (payload.tokenType !== tokenType || !payload.sub) return null;
    return payload.sub;
  } catch {
    return null;
  }
}
