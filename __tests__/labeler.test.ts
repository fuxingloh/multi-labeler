import * as core from '@actions/core'
import * as github from '@actions/github'
import {run} from '../src/labeler'
import * as fs from 'fs'

let labels: string[] = []

describe('main core and context', () => {
  beforeEach(() => {
    jest.spyOn(core, 'warning').mockImplementation(jest.fn())
    jest.spyOn(core, 'info').mockImplementation(jest.fn())
    jest.spyOn(core, 'debug').mockImplementation(jest.fn())
    jest.spyOn(core, 'setFailed').mockImplementation(jest.fn())

    // @ts-ignore, mock only required github client features
    jest.spyOn(github, 'getOctokit').mockImplementation((token: string) => {
      return {
        issues: {
          addLabels(params) {
            labels.push(...(params?.labels || []))
          }
        },
        repos: {
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
    })

    // Mock github context
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

  afterEach(() => {
    labels = []
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('should require token, error exit without', async function () {
    jest.spyOn(github, 'getOctokit').mockRestore()

    await expect(async () => {
      // @ts-ignore
      await run(undefined, '.github/labeler.yml')
    }).rejects.toThrow('Parameter token or opts.auth is required')
  })

  it('should be able to load default config', async function () {
    await run('token', '.github/labeler.yml')
  })

  it('no issue or pr should fail', async function () {
    github.context.payload = {}

    await expect(async () => {
      await run('token', '.github/labeler.yml')
    }).rejects.toThrow(
      'Could not get issue_number from pull_request or issue from context'
    )
  })

  it('empty should not fail', async function () {
    github.context.payload = {
      pull_request: {
        number: 1,
        title: 'nothing',
        body: 'nothing'
      }
    }

    await run('token', '__tests__/fixtures/empty.yml')
  })

  describe('basic.yml', () => {
    beforeEach(async () => {
      labels = []
    })

    it('should be empty', async function () {
      github.context.payload = {
        pull_request: {
          number: 1,
          title: 'nothing interesting'
        }
      }

      await run('token', '__tests__/fixtures/basic.yml')
      expect(labels).toEqual([])
    })

    it('should have feat', async function () {
      github.context.payload = {
        pull_request: {
          number: 1,
          title: 'feat: spaceship'
        }
      }

      await run('token', '__tests__/fixtures/basic.yml')
      expect(labels).toEqual(['feat'])
    })

    it('should have chore', async function () {
      github.context.payload = {
        pull_request: {
          number: 1,
          title: 'chore: refactoring'
        }
      }

      await run('token', '__tests__/fixtures/basic.yml')
      expect(labels).toEqual(['chore'])
    })

    it('should have fix', async function () {
      github.context.payload = {
        pull_request: {
          number: 1,
          title: 'fix: something'
        }
      }

      await run('token', '__tests__/fixtures/basic.yml')
      expect(labels).toEqual(['fix'])
    })

    it('should have docs', async function () {
      github.context.payload = {
        pull_request: {
          number: 1,
          title: 'docs: comment'
        }
      }

      await run('token', '__tests__/fixtures/basic.yml')
      expect(labels).toEqual(['docs'])
    })
  })
})
