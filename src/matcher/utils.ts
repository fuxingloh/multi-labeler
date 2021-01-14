export function matcherRegex(regex?: string, text?: string): boolean {
  if (!regex) {
    return false
  }

  if (!text) {
    return false
  }

  return new RegExp(regex).test(text)
}
