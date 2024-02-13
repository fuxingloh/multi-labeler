import { Config } from '../config';
import { GitHub } from '@actions/github/lib/utils';
import * as github from '@actions/github';
import { matcherRegex } from './utils';

export default function match(client: InstanceType<typeof GitHub>, config: Config): string[] {
  const payload = github.context.payload.pull_request;
  const ref = payload?.head?.ref;

  if (!ref) {
    return [];
  }

  return config
    .labels!.filter((value) => {
      return matcherRegex({ regex: value.matcher?.branch, text: ref });
    })
    .map((value) => value.label);
}
