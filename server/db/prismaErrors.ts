export function isPrismaRecordNotFoundError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  return 'code' in err && (err as { code?: unknown }).code === 'P2025'
}
