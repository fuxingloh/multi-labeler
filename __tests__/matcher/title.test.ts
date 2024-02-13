import match from '../../src/matcher/title';
import * as github from '@actions/github';
import { Config } from '../../src/config';

function getMatchedLabels(config: Config): string[] {
  // @ts-ignore
  return match(null, config);
}

const config: Config = {
  version: 'v1',
  labels: [
    {
      label: 'feat',
      matcher: {
        title: '^feat: .+',
      },
    },
    {
      label: 'fix',
      matcher: {
        title: '^fix: .+',
      },
    },
    {
      label: 'docs',
      matcher: {
        title: '^docs: .+',
      },
    },
    {
      label: 'chore',
      matcher: {
        title: '^chore: .+',
      },
    },
  ],
};

describe('empty', function () {
  it('no payload should be undefined', async function () {
    github.context.payload = {};
    expect(getMatchedLabels(config)).toEqual([]);
  });

  it('pull_request should be empty', async function () {
    github.context.payload = {
      pull_request: {
        number: 1,
        title: 'nothing interesting',
      },
    };

    expect(getMatchedLabels(config)).toEqual([]);
  });

  it('issue should be empty', async function () {
    github.context.payload = {
      issue: {
        number: 1,
        title: 'nothing interesting',
      },
    };

    expect(getMatchedLabels(config)).toEqual([]);
  });
});

describe('pull_request', () => {
  it('should have feat', async function () {
    github.context.payload = {
      pull_request: {
        number: 1,
        title: 'feat: spaceship',
      },
    };

    const labels = getMatchedLabels(config);
    expect(labels).toEqual(['feat']);
  });

  it('should have chore', async function () {
    github.context.payload = {
      pull_request: {
        number: 1,
        title: 'chore: refactoring',
      },
    };

    const labels = getMatchedLabels(config);
    expect(labels).toEqual(['chore']);
  });

  it('should have fix', async function () {
    github.context.payload = {
      pull_request: {
        number: 1,
        title: 'fix: something',
      },
    };

    const labels = getMatchedLabels(config);
    expect(labels).toEqual(['fix']);
  });

  it('should have docs', async function () {
    github.context.payload = {
      pull_request: {
        number: 1,
        title: 'docs: comment',
      },
    };

    const labels = getMatchedLabels(config);
    expect(labels).toEqual(['docs']);
  });
});

describe('issue', () => {
  it('should have feat', async function () {
    github.context.payload = {
      issue: {
        number: 1,
        title: 'feat: spaceship',
      },
    };

    const labels = getMatchedLabels(config);
    expect(labels).toEqual(['feat']);
  });

  it('should have chore', async function () {
    github.context.payload = {
      issue: {
        number: 1,
        title: 'chore: refactoring',
      },
    };

    const labels = getMatchedLabels(config);
    expect(labels).toEqual(['chore']);
  });

  it('should have fix', async function () {
    github.context.payload = {
      issue: {
        number: 1,
        title: 'fix: something',
      },
    };

    const labels = getMatchedLabels(config);
    expect(labels).toEqual(['fix']);
  });

  it('should have docs', async function () {
    github.context.payload = {
      issue: {
        number: 1,
        title: 'docs: comment',
      },
    };

    const labels = getMatchedLabels(config);
    expect(labels).toEqual(['docs']);
  });
});
