interface MatcherRegexParams {
  regex?: string;
  text: string;
}

export function matcherRegex({ regex, text }: MatcherRegexParams): boolean {
  if (!regex) {
    return false;
  }

  return new RegExp(regex).test(text);
}

export function matcherRegexAny(regex: string, anyTexts: string[]): boolean {
  const re = new RegExp(regex);
  return !!anyTexts.find((text) => {
    return re.test(text);
  });
}
