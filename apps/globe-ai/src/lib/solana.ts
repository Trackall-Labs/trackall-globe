const BASE58 = /^[1-9A-HJ-NP-Za-km-z]+$/;

export function isValidSolanaAddress(value: string) {
  const trimmed = value.trim();
  return trimmed.length >= 32 && trimmed.length <= 44 && BASE58.test(trimmed);
}

export function shortenWallet(value: string) {
  if (value.length <= 12) return value;
  return `${value.slice(0, 5)}...${value.slice(-5)}`;
}

