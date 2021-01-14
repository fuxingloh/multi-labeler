import match from '../../src/matcher/commits'
import * as github from '@actions/github'
import {Config} from '../../src/config'

async function getMatchedLabels(config: Config): Promise<string[]> {
  return await match({
    pulls: {
      listCommits: {
        endpoint: {
          // @ts-ignore
          merge(params) {
            return {pull_number: params.pull_number}
          }
        }
      }
    },
    // @ts-ignore
    paginate(params): Promise<any[]> {
      // @ts-ignore
      return Promise.resolve(commits[params.pull_number])
    }
  }, config)
}

const config: Config = {
  version: 'v1',
  labels: [
    {
      label: 'feat',
      matcher: {
        commits: '^feat: .*'
      }
    }
  ]
}

const commits = {
  1: [
    {
      commit: {message: 'no-commit:'},
    },
    {
      commit: {message: 'commit: commit'},
    }
  ],
  2: [
    {
      commit: {message: 'init'}
    },
    {
      commit: {message: 'feat: yes yes yes'}
    }
  ],
}

describe('commits', function () {
  beforeEach(() => {
    // Mock github context
    jest.spyOn(github.context, 'repo', 'get').mockImplementation(() => {
      return {
        owner: 'owner-name',
        repo: 'repo-name'
      }
    })

    github.context.payload = {
      pull_request: {
        number: 1,
        title: 'nothing interesting',
        head: {
          ref: 'spaceship'
        }
      }
    }
  })

  it('should be empty', async function () {
    expect(await getMatchedLabels(config)).toEqual([])
  })

  it('should have feat', async function () {
    github.context.payload = {
      pull_request: {
        number: 2
      }
    }

    const labels = await getMatchedLabels(config)
    expect(labels).toEqual(['feat'])
  })
});


