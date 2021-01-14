import * as yaml from 'js-yaml'
import * as t from 'io-ts'
import reporter from 'io-ts-reporters'
import {isRight} from 'fp-ts/Either'

const Matcher = t.partial({
  title: t.string,
  body: t.string,
  comments: t.string,
  commits: t.string,
  branch: t.string,
  files: t.union([t.string, t.array(t.string)])
})

const Label = t.type({
  label: t.string,
  matcher: t.union([Matcher, t.undefined])
})

const Config = t.type({
  version: t.keyof({
    v1: null
  }),
  labels: t.array(Label)
})

export type Matcher = t.TypeOf<typeof Matcher>
export type Label = t.TypeOf<typeof Label>
export type Config = t.TypeOf<typeof Config>

export function parse(content: string): Config {
  const config: any = yaml.load(content)

  const decoded = Config.decode(config)
  if (isRight(decoded)) {
    return decoded.right
  } else {
    throw new Error(
      `labeler.yml parse error:\\n${reporter.report(decoded).join('\\n')}`
    )
  }
}
