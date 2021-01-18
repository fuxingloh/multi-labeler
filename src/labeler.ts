import {GitHub} from '@actions/github/lib/utils'
import {Config} from './config'

import {uniq, concat, difference} from 'lodash'
import title from './matcher/title'
import body from './matcher/body'
import comment from './matcher/comment'
import branch from './matcher/branch'
import commits from './matcher/commits'
import files from './matcher/files'
import * as github from '@actions/github'

export function mergeLabels(labels: string[], config: Config): string[] {
  const payload =
    github.context.payload.pull_request || github.context.payload.issue

  const currents =
    (payload?.labels?.map((label: any) => label.name as string) as string[]) ||
    []

  const removals = (config.labels || [])
    .filter(label => {
      // Is sync, not matched and currently added as a label in payload
      return (
        label.sync &&
        !labels.includes(label.label) &&
        currents.includes(label.label)
      )
    })
    .map(value => value.label)

  return difference(uniq(concat(labels, currents)), removals)
}

export async function labels(
  client: InstanceType<typeof GitHub>,
  config: Config
): Promise<string[]> {
  if (!config.labels?.length) {
    return []
  }

  const labels = await Promise.all([
    title(client, config),
    body(client, config),
    comment(client, config),
    branch(client, config),
    commits(client, config),
    files(client, config)
  ]).then(value => {
    return uniq(concat(...value))
  })

  return mergeLabels(labels, config)
}
