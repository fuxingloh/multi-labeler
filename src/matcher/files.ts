import { Config } from '../config';
import { GitHub } from '@actions/github/lib/utils';
import * as github from '@actions/github';
import { Minimatch } from 'minimatch';

/**
 * Type-safe FileMatcher for convenience.
 */
interface FileMatcher {
  label: string;
  any: string[];
  all: string[];
  count?: FileCountMatcher;
}

interface FileCountMatcher {
  lte?: number;
  gte?: number;
  eq?: number;
  neq?: number;
}

/**
 * Get a type-safe FileMatcher
 */
function getMatchers(config: Config): FileMatcher[] {
  return config
    .labels!.filter((value) => {
      if (Array.isArray(value.matcher?.files)) {
        return value.matcher?.files.length;
      }

      return value.matcher?.files;
    })
    .map(({ label, matcher }) => {
      const files = matcher!.files!;
      if (typeof files === 'string') {
        return {
          label,
          any: [files],
          all: [],
        };
      }

      if (Array.isArray(files)) {
        return {
          label,
          any: files,
          all: [],
        };
      }

      return {
        label,
        any: files.any || [],
        all: files.all || [],
        count: {
          lte: files.count?.lte,
          gte: files.count?.gte,
          eq: files.count?.eq,
          neq: files.count?.neq,
        },
      };
    })
    .filter(({ any, all, count }) => {
      return any.length || all.length || count?.lte || count?.gte || count?.eq || count?.neq;
    });
}

async function getFiles(client: InstanceType<typeof GitHub>, pr_number: number): Promise<string[]> {
  const responses = await client.paginate(
    client.pulls.listFiles.endpoint.merge({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: pr_number,
    }),
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return responses.map((c: any) => c.filename);
}

/**
 * if globs is empty = matched
 * if globs is not empty, any files must match
 */
function anyMatch(files: string[], globs: string[]): boolean {
  if (!globs.length) {
    return true;
  }

  const matchers = globs.map((g) => new Minimatch(g));

  for (const matcher of matchers) {
    for (const file of files) {
      if (matcher.match(file)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * if globs is empty = matched
 * if globs is not empty, all files must match
 */
function allMatch(files: string[], globs: string[]): boolean {
  const matchers = globs.map((g) => new Minimatch(g));

  for (const matcher of matchers) {
    for (const file of files) {
      if (!matcher.match(file)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * if count not available, return true
 * else all count pattern must match,
 * ignored if any are undefined
 */
function countMatch(files: string[], count?: FileCountMatcher): boolean {
  if (!count) {
    return true;
  }

  return (
    (count?.eq === undefined || count.eq === files.length) &&
    (count?.neq === undefined || count.neq !== files.length) &&
    (count?.lte === undefined || count.lte >= files.length) &&
    (count?.gte === undefined || count.gte <= files.length)
  );
}

export default async function match(client: InstanceType<typeof GitHub>, config: Config): Promise<string[]> {
  const pr_number = github.context.payload.pull_request?.number;

  if (!pr_number) {
    return [];
  }

  const matchers = getMatchers(config);

  if (!matchers.length) {
    return [];
  }

  const files = await getFiles(client, pr_number);

  return matchers
    .filter((matcher) => {
      return allMatch(files, matcher.all) && anyMatch(files, matcher.any) && countMatch(files, matcher.count);
    })
    .map((value) => value.label);
}
