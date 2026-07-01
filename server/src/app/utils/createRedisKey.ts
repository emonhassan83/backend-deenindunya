export function createRedisKey(
  prefix: string,
  ...parts: (string | number)[]
): string {
  const validParts = parts.map((part) => {
    if (part === undefined || part === null || part === '') {
      throw new Error(
        `[RedisKeyError] Invalid key component passed for prefix "${prefix}". Received: ${part}`
      )
    }
    return String(part).trim()
  })

  const joinedParts = validParts.join(':')

  return joinedParts ? `${prefix}:${joinedParts}` : prefix
}
