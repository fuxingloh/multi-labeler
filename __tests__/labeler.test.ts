import * as core from '@actions/core'
import * as github from '@actions/github'
import {labels, mergeLabels} from '../src/labeler'
import {GitHub} from '@actions/github/lib/utils'
import {Config, getConfig} from '../src/config'
import * as fs from 'fs'

const client: InstanceType<typeof GitHub> = {
  repos: {
    // @ts-ignore
    getContent(params) {
      if (params?.path) {
        return {
          data: {
            content: fs.readFileSync(params.path, 'utf8'),
            encoding: 'utf-8'
          }
        }
      }
    }
  },
  pulls: {
    listCommits: {
      endpoint: {
        // @ts-ignore
        merge() {
          return {}
        }
      }
    },
    listFiles: {
      endpoint: {
        // @ts-ignore
        merge() {
          return {}
        }
      }
    }
  },
  // @ts-ignore
  paginate(params): Promise<any[]> {
    return Promise.resolve([])
  }
}

async function runLabels(configPath: string): Promise<string[]> {
  const config = await getConfig(client, configPath)
  return labels(client, config)
}

describe('labeler', () => {
  beforeEach(() => {
    jest.spyOn(core, 'warning').mockImplementation(jest.fn())
    jest.spyOn(core, 'info').mockImplementation(jest.fn())
    jest.spyOn(core, 'debug').mockImplementation(jest.fn())
    jest.spyOn(core, 'setFailed').mockImplementation(jest.fn())

    jest.spyOn(github.context, 'repo', 'get').mockImplementation(() => {
      return {
        owner: 'owner-name',
        repo: 'repo-name'
      }
    })

    github.context.ref = 'refs/heads/some-ref'
    github.context.sha = '1234567890123456789012345678901234567890'
    github.context.payload = {
      pull_request: {
        number: 1
      }
    }
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('should be able to load default config', async function () {
    await runLabels('.github/labeler.yml')
  })

  it('empty should not fail', async function () {
    github.context.payload = {
      pull_request: {
        number: 1,
        title: 'nothing',
        body: 'nothing'
      }
    }

    await runLabels('__tests__/fixtures/empty.yml')
  })

  describe('basic.yml', () => {
    it('should be empty', async function () {
      github.context.payload = {
        pull_request: {
          number: 1,
          title: 'nothing interesting'
        }
      }

      const labels = await runLabels('__tests__/fixtures/empty.yml')
      expect(labels).toEqual([])
    })

    it('should have feat', async function () {
      github.context.payload = {
        pull_request: {
          number: 1,
          title: 'feat: spaceship'
        }
      }

      const labels = await runLabels('__tests__/fixtures/basic.yml')
      expect(labels).toEqual(['feat'])
    })

    it('should have chore', async function () {
      github.context.payload = {
        pull_request: {
          number: 1,
          title: 'chore: refactoring'
        }
      }

      const labels = await runLabels('__tests__/fixtures/basic.yml')
      expect(labels).toEqual(['chore'])
    })

    it('should have fix', async function () {
      github.context.payload = {
        pull_request: {
          number: 1,
          title: 'fix: something'
        }
      }

      const labels = await runLabels('__tests__/fixtures/basic.yml')
      expect(labels).toEqual(['fix'])
    })

    it('should have docs', async function () {
      github.context.payload = {
        pull_request: {
          number: 1,
          title: 'docs: comment'
        }
      }

      const labels = await runLabels('__tests__/fixtures/basic.yml')
      expect(labels).toEqual(['docs'])
    })
  })
})

describe('mergeLabels, empty config', () => {
  const config: Config = {
    version: 'v1'
  }

  it('lhs empty should join', function () {
    github.context.payload = {
      pull_request: {
        number: 1,
        labels: []
      }
    }

    const labels = ['a', 'b', 'c']
    expect(mergeLabels(labels, config)).toEqual(labels)
  })

  it('rhs empty should join', function () {
    const labels = ['a', 'b', 'c']
    github.context.payload = {
      pull_request: {
        number: 1,
        labels: labels.map(value => {
          return {name: value}
        })
      }
    }

    expect(mergeLabels([], config)).toEqual(labels)
  })

  it('non empty should join', function () {
    const lhs = ['a', 'b', 'c']
    const rhs = ['d', 'e', 'f']
    github.context.payload = {
      pull_request: {
        number: 1,
        labels: lhs.map(value => {
          return {name: value}
        })
      }
    }

    expect(mergeLabels(rhs, config).sort()).toEqual([...lhs, ...rhs].sort())
  })

  it('should dedupe', function () {
    const lhs = ['a', 'b', 'c']
    const rhs = ['c', 'b', 'f']
    github.context.payload = {
      pull_request: {
        number: 1,
        labels: lhs.map(value => {
          return {name: value}
        })
      }
    }

    expect(mergeLabels(rhs, config).sort()).toEqual(['a', 'b', 'c', 'f'].sort())
  })
})

describe('mergeLabels, sync config', () => {
  const config: Config = {
    version: 'v1',
    labels: [
      {
        label: 'sync1',
        sync: true,
        matcher: {}
      },
      {
        label: 'sync2',
        sync: true,
        matcher: {}
      },
      {
        label: 'no-sync1',
        sync: false,
        matcher: {}
      },
      {
        label: 'no-sync2',
        matcher: {}
      }
    ]
  }

  it('lhs empty should join', function () {
    github.context.payload = {
      pull_request: {
        number: 1,
        labels: [
          {
            name: 'no-sync1'
          },
          {
            name: 'sync1'
          }
        ]
      }
    }

    const labels = ['a', 'b', 'c', 'no-sync1']
    expect(mergeLabels(labels, config).sort()).toEqual(labels.sort())
  })

  it('rhs empty should join', function () {
    github.context.payload = {
      pull_request: {
        number: 1,
        labels: ['a', 'b', 'c', 'no-sync2', 'sync2'].map(value => {
          return {name: value}
        })
      }
    }

    expect(mergeLabels([], config).sort()).toEqual(
      ['a', 'b', 'c', 'no-sync2'].sort()
    )
  })

  it('non empty should join', function () {
    github.context.payload = {
      pull_request: {
        number: 1,
        labels: ['a', 'b', 'c', 'no-sync1', 'sync1'].map(value => {
          return {name: value}
        })
      }
    }

    expect(mergeLabels(['d', 'e', 'f'], config).sort()).toEqual(
      ['a', 'b', 'c', 'd', 'e', 'f', 'no-sync1'].sort()
    )
  })

  it('should dedupe', function () {
    github.context.payload = {
      pull_request: {
        number: 1,
        labels: ['a', 'b', 'c', 'no-sync2', 'sync2'].map(value => {
          return {name: value}
        })
      }
    }

    expect(mergeLabels(['c', 'b', 'f'], config).sort()).toEqual(
      ['a', 'b', 'c', 'f', 'no-sync2'].sort()
    )
  })
})
