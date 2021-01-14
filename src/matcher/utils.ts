interface MatcherRegexParams {
  regex?: string
  text: string
}

export function matcherRegex({regex, text}: MatcherRegexParams): boolean {
  if (!regex) {
    return false
  }

  return new RegExp(regex).test(text)
}
