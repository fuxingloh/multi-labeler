import {GitHub} from '@actions/github/lib/utils'
import {Config} from './config'

import {uniq, concat} from 'lodash'
import title from './matcher/title'
import body from './matcher/body'
import comment from './matcher/comment'
import branch from './matcher/branch'
import commits from './matcher/commits'
import files from './matcher/files'

export async function labels(
  client: InstanceType<typeof GitHub>,
  config: Config
): Promise<string[]> {
  return Promise.all([
    title(client, config),
    body(client, config),
    comment(client, config),
    branch(client, config),
    commits(client, config),
    files(client, config)
  ]).then(value => {
    return uniq(concat(...value))
  })
}
