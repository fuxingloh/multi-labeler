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

const basic: Config = {
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

const complex: Config = {
  version: 'v1',
  labels: [
    {
      label: 'all-app',
      matcher: {
        files: {
          all: ['app/**']
        }
      }
    },
    {
      label: 'any-app',
      matcher: {
        files: {
          any: ['app/**']
        }
      }
    },
    {
      label: 'none-app',
      matcher: {
        files: {
          all: ['!app/**']
        }
      }
    },
    {
      label: 'all-any',
      matcher: {
        files: {
          any: ['security/**', 'setup/**'],
          all: ['!app/**'],
          count: {

          }
        }
      }
    },
    {
      label: 'S',
      matcher: {
        files: {
          count: {
            eq: 1
          }
        }
      }
    },
    {
      label: 'NEQ1',
      matcher: {
        files: {
          count: {
            neq: 1
          }
        }
      }
    },
    {
      label: 'M',
      matcher: {
        files: {
          count: {
            gte: 2,
            lte: 5,
          }
        }
      }
    },
    {
      label: 'L',
      matcher: {
        files: {
          count: {
            gte: 6,
          }
        }
      }
    },
    {
      label: 'mixed-1',
      matcher: {
        files: {
          any: ['app/**'],
          all: ['!setup/**'],
          count: {
            gte: 2,
            lte: 4,
          },
        }
      },
    },
    {
      label: 'invalid-1',
      matcher: {
        files: {
          any: ['app/**'],
          all: ['!setup/**'],
          count: {
            eq: 1,
            neq: 1,
            gte: 1,
            lte: 1,
          },
        }
      },
    },
    {
      label: 'invalid-2',
      matcher: {
        files: {
          any: [],
          all: [],
          count: {
            eq: 1,
            neq: 1,
            gte: 1,
            lte: 1,
          },
        }
      },
    },
    {
      label: 'invalid-3',
      matcher: {
        files: {
          any: [],
          all: ['!setup/**'],
          count: {
            eq: 1,
            neq: 1,
            gte: 1,
            lte: 1,
          },
        }
      },
    },
    {
      label: 'invalid-4',
      matcher: {
        files: {
          all: ['!setup/**'],
          count: {
            eq: 1,
            neq: 1,
            gte: 1,
            lte: 1,
          },
        }
      },
    },
    {
      label: 'invalid-5',
      matcher: {
        files: {
          any: ['!setup/**'],
          all: [],
          count: {
            eq: 1,
            neq: 1,
            gte: 1,
            lte: 1,
          },
        }
      },
    },
    {
      label: 'invalid-6',
      matcher: {
        files: {
          any: ['!setup/**'],
          count: {
            eq: 1,
            neq: 1,
            gte: 1,
            lte: 1,
          },
        }
      },
    },
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
    {
      filename: 'test/abc/abc.js',
    }
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
    {
      filename: '1/abc/abc.js',
    },
    {
      filename: '3/abc/abc.js',
    },
  ],
  8: [
    {filename: 'app/1.js'},
    {filename: 'app/2.js'},
    {filename: 'app/3.js'},
  ]
}

describe('basic', () => {
  beforeEach(() => {
    // Mock github context
    jest.spyOn(github.context, 'repo', 'get').mockImplementation(() => {
      return {
        owner: 'owner-name',
        repo: 'repo-name'
      }
    })
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('payload empty should be empty', async function () {
    github.context.payload = {}
    expect(await getMatchedLabels(basic)).toEqual([])
  })

  it('1 should have security/app/labeler', async function () {
    github.context.payload = {
      pull_request: {
        number: 1
      }
    }
    const labels = await getMatchedLabels(basic)
    expect(labels).toEqual(['security', 'app', 'labeler'])
  })

  it('2 should have labeler', async function () {
    github.context.payload = {
      pull_request: {
        number: 2
      }
    }
    const labels = await getMatchedLabels(basic)
    expect(labels).toEqual(['labeler'])
  })

  it('3 should have app', async function () {
    github.context.payload = {
      pull_request: {
        number: 3
      }
    }
    const labels = await getMatchedLabels(basic)
    expect(labels).toEqual(['app'])
  })

  it('4 should have security', async function () {
    github.context.payload = {
      pull_request: {
        number: 4
      }
    }
    const labels = await getMatchedLabels(basic)
    expect(labels).toEqual(['security'])
  })

  it('5 should have security', async function () {
    github.context.payload = {
      pull_request: {
        number: 5
      }
    }
    const labels = await getMatchedLabels(basic)
    expect(labels).toEqual(['security'])
  })

  it('6 should be empty', async function () {
    github.context.payload = {
      pull_request: {
        number: 6
      }
    }
    const labels = await getMatchedLabels(basic)
    expect(labels).toEqual([])
  })

  it('7 should be empty', async function () {
    github.context.payload = {
      pull_request: {
        number: 7
      }
    }
    const labels = await getMatchedLabels(basic)
    expect(labels).toEqual([])
  })
});

describe('complex', () => {
  beforeEach(() => {
    // Mock github context
    jest.spyOn(github.context, 'repo', 'get').mockImplementation(() => {
      return {
        owner: 'owner-name',
        repo: 'repo-name'
      }
    })
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('1 should have complex labels', async function () {
    github.context.payload = {
      pull_request: {
        number: 1
      }
    }
    const labels = await getMatchedLabels(complex)
    expect(labels).toEqual([
      'any-app',
      'NEQ1',
      'L',
    ])
  })

  it('2 should have complex labels', async function () {
    github.context.payload = {
      pull_request: {
        number: 2
      }
    }
    const labels = await getMatchedLabels(complex)
    expect(labels).toEqual([
      'none-app',
      'S'
    ])
  })

  it('3 should have complex labels', async function () {
    github.context.payload = {
      pull_request: {
        number: 3
      }
    }
    const labels = await getMatchedLabels(complex)
    expect(labels).toEqual([
      'any-app',
      'NEQ1',
      'M'
    ])
  })

  it('4 should have complex labels', async function () {
    github.context.payload = {
      pull_request: {
        number: 4
      }
    }
    const labels = await getMatchedLabels(complex)
    expect(labels).toEqual([
         "none-app",
         "all-any",
         "S",
    ])
  })

  it('5 should have complex labels', async function () {
    github.context.payload = {
      pull_request: {
        number: 5
      }
    }
    const labels = await getMatchedLabels(complex)
    expect(labels).toEqual([
      "none-app",
      "all-any",
      "S",
    ])
  })

  it('6 should have complex labels', async function () {
    github.context.payload = {
      pull_request: {
        number: 6
      }
    }
    const labels = await getMatchedLabels(complex)
    expect(labels).toEqual([
      "none-app",
      "all-any",
      "S",
    ])
  })

  it('7 should have complex labels', async function () {
    github.context.payload = {
      pull_request: {
        number: 7
      }
    }
    const labels = await getMatchedLabels(complex)
    expect(labels).toEqual([
         "none-app",
         "all-any",
         "NEQ1",
         "M",
    ])
  })

  it('8 should have complex labels', async function () {
    github.context.payload = {
      pull_request: {
        number: 8
      }
    }
    const labels = await getMatchedLabels(complex)
    expect(labels).toEqual([
         "all-app",
         "any-app",
         "NEQ1",
         "M",
         "mixed-1",
    ])
  })
})
