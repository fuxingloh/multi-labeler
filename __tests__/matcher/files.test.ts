import match from '../../src/matcher/files'
import * as github from '@actions/github'
import {Config} from '../../src/config'

async function getMatchedLabels(config: Config): Promise<string[]> {
  return await match({
    pulls: {
      listFiles: {
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
      return Promise.resolve(files[params.pull_number])
    }
  }, config)
}

const config: Config = {
  version: 'v1',
  labels: [
    {
      label: 'security',
      matcher: {
        files: ['security/**', 'setup/**.xml']
      }
    },
    {
      label: 'app',
      matcher: {
        files: 'app/**'
      }
    },
    {
      label: 'labeler',
      matcher: {
        files: '.github/labeler.yml'
      }
    }
  ]
}

const files = {
  1: [
    {
      filename: '.github/labeler.yml',
    },
    {
      filename: 'app/main.js',
    },
    {
      filename: 'security/main.js',
    },
    {
      filename: 'security/abc/abc.js',
    },
    {
      filename: 'setup/abc/abc.xml',
    },
    {
      filename: 'setup/abc/abc.js',
    },
  ],
  2: [
    {
      filename: '.github/labeler.yml',
    },
  ],
  3: [
    {
      filename: 'app/main.js',
    },
    {
      filename: 'setup/abc/abc.js',
    },
  ],
  4: [
    {
      filename: 'security/main.js',
    },
  ],
  5: [
    {
      filename: 'security/abc/abc.js',
    },
  ],
  6: [
    {
      filename: 'setup/abc/abc.xml',
    },
  ],
  7: [
    {
      filename: 'setup/abc/abc.js',
    },
  ]
}

describe('files', function () {
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
      }
    }
  })

  it('1 should have security/app/labeler', async function () {
    github.context.payload = {
      pull_request: {
        number: 1
      }
    }
    const labels = await getMatchedLabels(config)
    expect(labels).toEqual(['security', 'app', 'labeler'])
  })

  it('2 should have labeler', async function () {
    github.context.payload = {
      pull_request: {
        number: 2
      }
    }
    const labels = await getMatchedLabels(config)
    expect(labels).toEqual(['labeler'])
  })

  it('3 should have app', async function () {
    github.context.payload = {
      pull_request: {
        number: 3
      }
    }
    const labels = await getMatchedLabels(config)
    expect(labels).toEqual(['app'])
  })

  it('4 should have security', async function () {
    github.context.payload = {
      pull_request: {
        number: 4
      }
    }
    const labels = await getMatchedLabels(config)
    expect(labels).toEqual(['security'])
  })

  it('5 should have security', async function () {
    github.context.payload = {
      pull_request: {
        number: 5
      }
    }
    const labels = await getMatchedLabels(config)
    expect(labels).toEqual(['security'])
  })

  it('6 should be empty', async function () {
    github.context.payload = {
      pull_request: {
        number: 6
      }
    }
    const labels = await getMatchedLabels(config)
    expect(labels).toEqual([])
  })

  it('7 should be empty', async function () {
    github.context.payload = {
      pull_request: {
        number: 7
      }
    }
    const labels = await getMatchedLabels(config)
    expect(labels).toEqual([])
  })
});


