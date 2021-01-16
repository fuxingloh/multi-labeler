import * as core from '@actions/core'
import * as github from '@actions/github'
import {labels} from '../src/labeler'
import {GitHub} from '@actions/github/lib/utils'
import {getConfig} from '../src/config'
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
