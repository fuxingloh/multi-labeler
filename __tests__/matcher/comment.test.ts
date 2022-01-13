import match from '../../src/matcher/comment'
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
      label: 'checkbox',
      matcher: {
        comment: '(\\n|.)*- \\[x\\] checkbox(\\n|.)*'
      }
    },
    {
      label: 'stale',
      matcher: {
        comment: '/stale'
      }
    }
  ]
}

describe('empty', function () {
  it('should be undefined', async function () {
    github.context.payload = {}
    expect(getMatchedLabels(config)).toEqual([])
  })

  it('comment should be empty', async function () {
    github.context.payload = {
      comment: {
        id: 1,
        body: 'nothing'
      }
    }

    expect(getMatchedLabels(config)).toEqual([])
  })
})

describe('comment', () => {
  it('should have checkbox', async function () {
    github.context.payload = {
      comment: {
        id: 1,
        body: 'What is the issue:\n- [x] checkbox\n- [ ] no problem'
      }
    }

    const labels = getMatchedLabels(config)
    expect(labels).toEqual(['checkbox'])
  })

  it('should have checkbox newline again', async function () {
    github.context.payload = {
      comment: {
        id: 1,
        body: 'What is the issue\nnewline:\n- [x] checkbox\n- [ ] no problem'
      }
    }

    const labels = getMatchedLabels(config)
    expect(labels).toEqual(['checkbox'])
  })

  it('should have stale', async function () {
    github.context.payload = {
      comment: {
        id: 1,
        body: '/stale'
      }
    }

    const labels = getMatchedLabels(config)
    expect(labels).toEqual(['stale'])
  })
})
