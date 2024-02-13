import { Config, Label } from '../config';
import { GitHub } from '@actions/github/lib/utils';
import * as github from '@actions/github';

function getAuthors(label: Label): string[] {
  const author = label.matcher?.author;
  if (typeof author === 'string') {
    return [author];
  }

  if (Array.isArray(author)) {
    return [...author];
  }

  return [];
}

export default function match(client: InstanceType<typeof GitHub>, config: Config): string[] {
  const payload = github.context.payload.pull_request || github.context.payload.issue;
  const author = payload?.user?.login;

  if (!author) {
    return [];
  }

  return config
    .labels!.filter((label) => {
      const authors = getAuthors(label);

      if (authors.length > 0) {
        return authors.includes(author);
      }

      return false;
    })
    .map((value) => value.label);
}
