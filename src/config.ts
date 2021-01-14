import * as yaml from 'js-yaml'
import * as t from 'io-ts'
import reporter from 'io-ts-reporters'
import {isRight} from 'fp-ts/Either'

const Matcher = t.partial({
  files: t.union([t.string, t.array(t.string)]),
  title: t.string,
  commits: t.string,
  description: t.string,
  comments: t.string
})

const Status = t.intersection([
  t.type({
    context: t.string,
    condition: t.keyof({
      always: null,
      any: null,
      none: null,
      all: null
    })
  }),
  t.partial({
    description: t.string
  })
])

const Label = t.intersection([
  t.union([
    t.type({
      label: t.string,
      matcher: Matcher
    }),
    t.type({
      group: t.array(
        t.type({
          label: t.string,
          matcher: Matcher
        })
      )
    })
  ]),
  t.partial({
    'status-success': Status,
    'status-failure': Status,
    fail: t.keyof({
      always: null
    }),
    sync: t.boolean
  })
])

const LabelerConfig = t.type({
  version: t.keyof({
    v1: null
  }),
  labels: t.array(Label)
})

export type Matcher = t.TypeOf<typeof Matcher>
export type Status = t.TypeOf<typeof Status>
export type Label = t.TypeOf<typeof Label>
export type LabelerConfig = t.TypeOf<typeof LabelerConfig>

export function parse(content: string): LabelerConfig {
  const config: any = yaml.load(content)

  const decoded = LabelerConfig.decode(config)
  if (isRight(decoded)) {
    return decoded.right
  } else {
    throw new Error(
      `labeler.yml parse error: ${reporter.report(decoded).join('\\n')}`
    )
  }
}
