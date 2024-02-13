import * as core from '@actions/core';
import * as github from '@actions/github';
import { GitHub } from '@actions/github/lib/utils';
import { getConfig } from '../src/config';
import * as fs from 'fs';
import { checks, is, StatusCheck } from '../src/checks';

const client: InstanceType<typeof GitHub> = {
  rest: {
    repos: {
      // @ts-ignore
      getContent(params) {
        if (params?.path) {
          return {
            data: {
              content: fs.readFileSync(params.path, 'utf8'),
              encoding: 'utf-8',
            },
          };
        }
      },
    },
  },
};

async function runChecks(configPath: string, labels: string[]): Promise<StatusCheck[]> {
  const config = await getConfig(client, configPath, 'owner-name/repo-name');
  return checks(client, config, labels);
}

describe('is', () => {
  it('should empty true', function () {
    expect(
      is(
        {
          context: 'abc',
        },
        ['a'],
      ),
    ).toBeTruthy();
  });

  it('should empty true with labels', function () {
    expect(
      is(
        {
          context: 'abc',
          labels: {},
        },
        ['a'],
      ),
    ).toBeTruthy();
  });

  it('should any true a', function () {
    expect(
      is(
        {
          context: 'abc',
          labels: {
            any: ['a'],
          },
        },
        ['a', 'b'],
      ),
    ).toBeTruthy();
  });

  it('should any true b', function () {
    expect(
      is(
        {
          context: 'abc',
          labels: {
            any: ['b'],
          },
        },
        ['a', 'b'],
      ),
    ).toBeTruthy();
  });

  it('should any false', function () {
    expect(
      is(
        {
          context: 'abc',
          labels: {
            any: ['c'],
          },
        },
        ['a', 'b'],
      ),
    ).toBeFalsy();
  });

  it('should any all 3/3', function () {
    expect(
      is(
        {
          context: 'abc',
          labels: {
            all: ['a', 'b', 'c'],
          },
        },
        ['a', 'b', 'c'],
      ),
    ).toBeTruthy();
  });

  it('should all true 3/4', function () {
    expect(
      is(
        {
          context: 'abc',
          labels: {
            all: ['a', 'b', 'c'],
          },
        },
        ['a', 'b', 'c', 'd'],
      ),
    ).toBeTruthy();
  });

  it('should all false 4/3', function () {
    expect(
      is(
        {
          context: 'abc',
          labels: {
            all: ['a', 'b', 'c', 'd'],
          },
        },
        ['a', 'b', 'c'],
      ),
    ).toBeFalsy();
  });

  it('should all false 4/1', function () {
    expect(
      is(
        {
          context: 'abc',
          labels: {
            all: ['a', 'b', 'c', 'd'],
          },
        },
        ['a'],
      ),
    ).toBeFalsy();
  });

  it('should all false 1/1', function () {
    expect(
      is(
        {
          context: 'abc',
          labels: {
            all: ['d'],
          },
        },
        ['a'],
      ),
    ).toBeFalsy();
  });

  describe('any all', function () {
    it('should any all true', function () {
      expect(
        is(
          {
            context: 'abc',
            labels: {
              any: ['a', 'b'],
              all: ['d'],
            },
          },
          ['a', 'd'],
        ),
      ).toBeTruthy();
    });

    it('should any all true', function () {
      expect(
        is(
          {
            context: 'abc',
            labels: {
              any: ['a', 'b'],
              all: ['d'],
            },
          },
          ['b', 'd'],
        ),
      ).toBeTruthy();
    });

    it('should any all true', function () {
      expect(
        is(
          {
            context: 'abc',
            labels: {
              any: ['a', 'b'],
              all: ['d', 'e'],
            },
          },
          ['a', 'd', 'e'],
        ),
      ).toBeTruthy();
    });

    it('should any all true', function () {
      expect(
        is(
          {
            context: 'abc',
            labels: {
              any: ['a', 'b'],
              all: ['d', 'e'],
            },
          },
          ['b', 'd', 'e'],
        ),
      ).toBeTruthy();
    });

    it('should any all false', function () {
      expect(
        is(
          {
            context: 'abc',
            labels: {
              any: ['a', 'b'],
              all: ['d', 'e'],
            },
          },
          [],
        ),
      ).toBeFalsy();
    });

    it('should any all false', function () {
      expect(
        is(
          {
            context: 'abc',
            labels: {
              any: ['a', 'b'],
              all: ['d', 'e'],
            },
          },
          ['d', 'e'],
        ),
      ).toBeFalsy();
    });

    it('should any all false', function () {
      expect(
        is(
          {
            context: 'abc',
            labels: {
              any: ['a', 'b'],
              all: ['d', 'e'],
            },
          },
          ['d', 'e', 'f'],
        ),
      ).toBeFalsy();
    });

    it('should any all false', function () {
      expect(
        is(
          {
            context: 'abc',
            labels: {
              any: ['a', 'b'],
              all: ['d', 'e'],
            },
          },
          ['d', 'a', 'f'],
        ),
      ).toBeFalsy();
    });

    it('should any all false', function () {
      expect(
        is(
          {
            context: 'abc',
            labels: {
              any: ['a', 'b'],
              all: ['d', 'e'],
            },
          },
          ['d', 'a', 'b'],
        ),
      ).toBeFalsy();
    });

    it('should any all false', function () {
      expect(
        is(
          {
            context: 'abc',
            labels: {
              any: ['a', 'b'],
              all: ['d', 'e'],
            },
          },
          ['e', 'b'],
        ),
      ).toBeFalsy();
    });
  });

  describe('none', function () {
    it('should be false when none is present', function () {
      expect(
        is(
          {
            context: 'abc',
            labels: {
              none: ['b'],
            },
          },
          ['a', 'b'],
        ),
      ).toBeFalsy();
    });

    it('should be true when none is not present', function () {
      expect(
        is(
          {
            context: 'abc',
            labels: {
              none: ['c'],
            },
          },
          ['a', 'b'],
        ),
      ).toBeTruthy();
    });

    it('should be true when none is not present but all not valid', function () {
      expect(
        is(
          {
            context: 'abc',
            labels: {
              none: ['c'],
              all: ['b'],
            },
          },
          ['a', 'd'],
        ),
      ).toBeFalsy();
    });
  });
});

describe('checks', () => {
  beforeEach(() => {
    jest.spyOn(core, 'warning').mockImplementation(jest.fn());
    jest.spyOn(core, 'info').mockImplementation(jest.fn());
    jest.spyOn(core, 'debug').mockImplementation(jest.fn());
    jest.spyOn(core, 'setFailed').mockImplementation(jest.fn());

    jest.spyOn(github.context, 'repo', 'get').mockImplementation(() => {
      return {
        owner: 'owner-name',
        repo: 'repo-name',
      };
    });

    github.context.payload = {
      pull_request: {
        number: 1,
        labels: [],
      },
    };
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should be empty without payload', async function () {
    github.context.payload = {};

    const checks = await runChecks('__tests__/fixtures/basic.yml', ['feat']);

    expect(checks.length).toBe(0);
  });

  it('no checks', async function () {
    const checks = await runChecks('__tests__/fixtures/basic.yml', ['feat']);

    expect(checks.length).toBe(0);
  });

  it('success always', async function () {
    const checks = await runChecks('__tests__/fixtures/checks-always.yml', []);

    expect(checks.length).toBe(1);
    expect(checks[0].url).toBeFalsy();
    expect(checks[0].context).toBe('Always');
    expect(checks[0].state).toBe('success');
    expect(checks[0].description).toBe('Always description');
  });

  it('failure always', async function () {
    const checks = await runChecks('__tests__/fixtures/checks-failure.yml', []);

    expect(checks.length).toBe(1);
    expect(checks[0].url).toBeFalsy();
    expect(checks[0].context).toBe('Always');
    expect(checks[0].state).toBe('failure');
    expect(checks[0].description).toBe('Always failure');
  });

  it('feat: success state', async function () {
    const checks = await runChecks('__tests__/fixtures/semantic-release.yml', ['feat']);

    expect(checks.length).toBe(1);
    expect(checks[0].context).toBe('Semantic Pull Request');
    expect(checks[0].url).toBe('https://github.com/fuxingloh/multi-labeler/blob/main/.github/labeler.yml');
    expect(checks[0].state).toBe('success');
    expect(checks[0].description).toBe('Ready for review & merge.');
  });

  it('feat: success state', async function () {
    const checks = await runChecks('__tests__/fixtures/semantic-release.yml', ['feat']);

    expect(checks.length).toBe(1);
    expect(checks[0].context).toBe('Semantic Pull Request');
    expect(checks[0].url).toBe('https://github.com/fuxingloh/multi-labeler/blob/main/.github/labeler.yml');
    expect(checks[0].state).toBe('success');
    expect(checks[0].description).toBe('Ready for review & merge.');
  });

  it('chore: success state', async function () {
    const checks = await runChecks('__tests__/fixtures/semantic-release.yml', ['chore']);

    expect(checks.length).toBe(1);
    expect(checks[0].context).toBe('Semantic Pull Request');
    expect(checks[0].url).toBe('https://github.com/fuxingloh/multi-labeler/blob/main/.github/labeler.yml');
    expect(checks[0].state).toBe('success');
    expect(checks[0].description).toBe('Ready for review & merge.');
  });

  it('docs: success state', async function () {
    const checks = await runChecks('__tests__/fixtures/semantic-release.yml', ['docs']);

    expect(checks.length).toBe(1);
    expect(checks[0].context).toBe('Semantic Pull Request');
    expect(checks[0].url).toBe('https://github.com/fuxingloh/multi-labeler/blob/main/.github/labeler.yml');
    expect(checks[0].state).toBe('success');
    expect(checks[0].description).toBe('Ready for review & merge.');
  });

  it('fix: success state', async function () {
    const checks = await runChecks('__tests__/fixtures/semantic-release.yml', ['none', 'bug', 'fix']);

    expect(checks.length).toBe(1);
    expect(checks[0].context).toBe('Semantic Pull Request');
    expect(checks[0].url).toBe('https://github.com/fuxingloh/multi-labeler/blob/main/.github/labeler.yml');
    expect(checks[0].state).toBe('success');
    expect(checks[0].description).toBe('Ready for review & merge.');
  });

  it('failure state', async function () {
    const checks = await runChecks('__tests__/fixtures/semantic-release.yml', ['c']);

    expect(checks.length).toBe(1);
    expect(checks[0].context).toBe('Semantic Pull Request');
    expect(checks[0].url).toBe('https://github.com/fuxingloh/multi-labeler/blob/main/.github/labeler.yml');
    expect(checks[0].state).toBe('failure');
    expect(checks[0].description).toBe('Missing semantic label for merge.');
  });
});
