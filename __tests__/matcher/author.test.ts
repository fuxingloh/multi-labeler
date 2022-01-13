import match from '../../src/matcher/author'
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
      label: 'empty'
    },
    {
      label: 'string',
      matcher: {
        author: 'fuxingloh'
      }
    },
    {
      label: 'array',
      matcher: {
        author: ['fuxingloh', 'claire', 'adam']
      }
    },
    {
      label: 'dragon',
      matcher: {
        author: ['dragon']
      }
    },
    {
      label: 'tiger',
      matcher: {
        author: 'tiger'
      }
    }
  ]
}

describe('empty', function () {
  it('no payload should be empty', async function () {
    github.context.payload = {}
    expect(getMatchedLabels(config)).toEqual([])
  })

  it('pull_request should be empty', async function () {
    github.context.payload = {
      pull_request: {
        number: 1,
        title: 'nothing interesting',
        user: {
          login: 'github-actions'
        }
      }
    }

    expect(getMatchedLabels(config)).toEqual([])
  })

  it('issue should be empty', async function () {
    github.context.payload = {
      issue: {
        number: 1,
        title: 'nothing interesting',
        user: {
          login: 'github-actions'
        }
      }
    }

    expect(getMatchedLabels(config)).toEqual([])
  })
})

describe('pull_request', () => {
  it('should have string and array', async function () {
    github.context.payload = {
      pull_request: {
        number: 1,
        title: 'this is a pull_request',
        user: {
          login: 'fuxingloh'
        }
      }
    }

    const labels = getMatchedLabels(config)
    expect(labels.sort()).toEqual(['string', 'array'].sort())
  })

  it('claire should have array', async function () {
    github.context.payload = {
      pull_request: {
        number: 1,
        user: {
          login: 'claire'
        }
      }
    }

    const labels = getMatchedLabels(config)
    expect(labels).toEqual(['array'])
  })

  it('adam should have array', async function () {
    github.context.payload = {
      pull_request: {
        number: 1,
        user: {
          login: 'adam'
        }
      }
    }

    const labels = getMatchedLabels(config)
    expect(labels).toEqual(['array'])
  })

  it('should have dragon', async function () {
    github.context.payload = {
      pull_request: {
        number: 1,
        user: {
          login: 'dragon'
        }
      }
    }

    const labels = getMatchedLabels(config)
    expect(labels).toEqual(['dragon'])
  })

  it('should have tiger', async function () {
    github.context.payload = {
      pull_request: {
        number: 1,
        user: {
          login: 'tiger'
        }
      }
    }

    const labels = getMatchedLabels(config)
    expect(labels).toEqual(['tiger'])
  })
})

describe('issue', () => {
  it('should have string and array', async function () {
    github.context.payload = {
      issue: {
        number: 1,
        title: 'this is a issue',
        user: {
          login: 'fuxingloh'
        }
      }
    }

    const labels = getMatchedLabels(config)
    expect(labels.sort()).toEqual(['string', 'array'].sort())
  })

  it('claire should have array', async function () {
    github.context.payload = {
      issue: {
        number: 1,
        user: {
          login: 'claire'
        }
      }
    }

    const labels = getMatchedLabels(config)
    expect(labels).toEqual(['array'])
  })

  it('adam should have array', async function () {
    github.context.payload = {
      issue: {
        number: 1,
        user: {
          login: 'adam'
        }
      }
    }

    const labels = getMatchedLabels(config)
    expect(labels).toEqual(['array'])
  })

  it('should have dragon', async function () {
    github.context.payload = {
      issue: {
        number: 1,
        user: {
          login: 'dragon'
        }
      }
    }

    const labels = getMatchedLabels(config)
    expect(labels).toEqual(['dragon'])
  })

  it('should have tiger', async function () {
    github.context.payload = {
      issue: {
        number: 1,
        user: {
          login: 'tiger'
        }
      }
    }

    const labels = getMatchedLabels(config)
    expect(labels).toEqual(['tiger'])
  })
})
