import {GitHub} from '@actions/github/lib/utils'

import {uniq} from 'lodash'
import {Config} from '../config'

import title from './title'
import body from './body'
import branch from './branch'
import commits from './commits'
import files from './files'

export async function getLabels(
  client: InstanceType<typeof GitHub>,
  config: Config
): Promise<string[]> {
  return uniq([
    ...title(client, config),
    ...body(client, config),
    ...branch(client, config),
    ...(await commits(client, config)),
    ...(await files(client, config))
  ])
}
