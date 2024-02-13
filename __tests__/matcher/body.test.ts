import match from '../../src/matcher/body';
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
      label: 'checkbox',
      matcher: {
        body: '(\\n|.)*- \\[x\\] checkbox(\\n|.)*',
      },
    },
    {
      label: 'something',
      matcher: {
        body: '.* something .*',
      },
    },
  ],
};

describe('empty', function () {
  it('should be undefined', async function () {
    github.context.payload = {};
    expect(getMatchedLabels(config)).toEqual([]);
  });

  it('pull_request should be empty', async function () {
    github.context.payload = {
      pull_request: {
        number: 1,
        title: 'empty',
        body: 'nothing',
      },
    };

    expect(getMatchedLabels(config)).toEqual([]);
  });

  it('issue should be empty', async function () {
    github.context.payload = {
      issue: {
        number: 1,
        title: 'empty',
        body: 'nothing',
      },
    };

    expect(getMatchedLabels(config)).toEqual([]);
  });
});

describe('pull_request', () => {
  it('should have checkbox', async function () {
    github.context.payload = {
      pull_request: {
        number: 1,
        title: 'feat: spaceship',
        body: 'What is the issue:\n- [x] checkbox\n- [ ] no problem',
      },
    };

    const labels = getMatchedLabels(config);
    expect(labels).toEqual(['checkbox']);
  });

  it('should have something', async function () {
    github.context.payload = {
      pull_request: {
        number: 1,
        title: 'chore: refactoring',
        body: ' something ',
      },
    };

    const labels = getMatchedLabels(config);
    expect(labels).toEqual(['something']);
  });

  it('should have something newline', async function () {
    github.context.payload = {
      pull_request: {
        number: 1,
        title: 'chore: refactoring',
        body: 'one\n said something here \n',
      },
    };

    const labels = getMatchedLabels(config);
    expect(labels).toEqual(['something']);
  });
});

describe('issue', () => {
  it('should have checkbox', async function () {
    github.context.payload = {
      issue: {
        number: 1,
        title: 'feat: spaceship',
        body: 'What is the issue:\n- [x] checkbox\n- [ ] no problem',
      },
    };

    const labels = getMatchedLabels(config);
    expect(labels).toEqual(['checkbox']);
  });

  it('should have something', async function () {
    github.context.payload = {
      issue: {
        number: 1,
        title: 'chore: refactoring',
        body: ' something ',
      },
    };

    const labels = getMatchedLabels(config);
    expect(labels).toEqual(['something']);
  });

  it('should have something newline', async function () {
    github.context.payload = {
      issue: {
        number: 1,
        title: 'chore: refactoring',
        body: 'one\n said something here \n',
      },
    };

    const labels = getMatchedLabels(config);
    expect(labels).toEqual(['something']);
  });
});
