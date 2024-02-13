import { GitHub } from '@actions/github/lib/utils';
import { Check, Config } from './config';
import * as github from '@actions/github';

export interface StatusCheck {
  context: string;
  state: 'success' | 'failure';
  description?: string;
  url?: string;
}

export function is(check: Check, labels: string[]): boolean {
  if (check.labels?.any?.length) {
    if (!labels.some((label) => check.labels?.any?.includes(label))) {
      return false;
    }
  }

  if (check.labels?.all?.length) {
    if (!check.labels?.all?.every((label) => labels.includes(label))) {
      return false;
    }
  }

  if (check.labels?.none?.length) {
    if (check.labels?.none?.some((label) => labels.includes(label))) {
      return false;
    }
  }

  return true;
}

export async function checks(
  client: InstanceType<typeof GitHub>,
  config: Config,
  labels: string[],
): Promise<StatusCheck[]> {
  if (!github.context.payload.pull_request) {
    return [];
  }

  if (!config.checks?.length) {
    return [];
  }

  return config.checks.map((check) => {
    if (is(check, labels)) {
      return {
        context: check.context,
        url: check.url,
        state: 'success',
        description: typeof check.description === 'string' ? check.description : check.description?.success,
      };
    } else {
      return {
        context: check.context,
        url: check.url,
        state: 'failure',
        description: typeof check.description === 'string' ? check.description : check.description?.failure,
      };
    }
  });
}
