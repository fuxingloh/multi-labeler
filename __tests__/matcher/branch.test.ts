import match from '../../src/matcher/branch'
import * as github from '@actions/github'
import {Config} from '../../src/config'

function getMatchedLabels(config: Config): string[] {
  // @ts-ignore
  return match(null, config)
}

const config: Config = {
  version: 'v1',
  labels: [
    {
      label: 'feat',
      matcher: {
        branch: '^feat/.*'
      }
    }
  ]
}

describe('empty', function () {
  it('no payload should be undefined', async function () {
    github.context.payload = {}
    expect(getMatchedLabels(config)).toEqual([])
  })

  it('pull_request should be empty', async function () {
    github.context.payload = {
      pull_request: {
        number: 1,
        title: 'nothing interesting',
        head: {
          ref: 'spaceship'
        }
      }
    }

    expect(getMatchedLabels(config)).toEqual([])
  })
});

describe('pull_request', () => {
  it('should have feat', async function () {
    github.context.payload = {
      pull_request: {
        number: 1,
        title: 'spaceship',
        head: {
          ref: 'feat/spaceship'
        }
      }
    }

    const labels = getMatchedLabels(config)
    expect(labels).toEqual(['feat'])
  })
})

