import { Config } from '../config';
import { GitHub } from '@actions/github/lib/utils';
import * as github from '@actions/github';
import { matcherRegex } from './utils';

export default function match(client: InstanceType<typeof GitHub>, config: Config): string[] {
  const body = github.context.payload.comment?.body;

  if (!body) {
    return [];
  }

  return config
    .labels!.filter((value) => {
      return matcherRegex({ regex: value.matcher?.comment, text: body });
    })
    .map((value) => value.label);
}
