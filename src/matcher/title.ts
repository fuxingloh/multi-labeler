import {Matched} from './'
import {Config} from '../config'
import {GitHub} from '@actions/github/lib/utils'
import * as github from '@actions/github'
import {matcherRegex} from './utils'

export default function match(
  client: InstanceType<typeof GitHub>,
  config: Config
): Matched | undefined {
  const payload =
    github.context.payload.pull_request || github.context.payload.issue

  if (!payload) {
    return
  }

  const labels = config.labels
    .filter(value => {
      return matcherRegex(value.matcher?.title, payload?.title)
    })
    .map(value => value.label)

  return {
    append: labels
  }
}
