import {GitHub} from '@actions/github/lib/utils'

import {uniq} from 'lodash'
import {Config} from '../config'

import title from './title'
import body from './body'
import branch from './branch'

export function getLabels(
  client: InstanceType<typeof GitHub>,
  config: Config
): string[] {
  return uniq([
    ...title(client, config),
    ...body(client, config),
    ...branch(client, config)
  ])
}
