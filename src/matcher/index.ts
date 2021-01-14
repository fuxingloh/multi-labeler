import {GitHub} from '@actions/github/lib/utils'

import {uniq, uniqBy} from 'lodash'
import {LabelerConfig} from '../config'

import title from './title'

export interface Matched {
  add: string[]
  remove: string[]
  status: Status[]
}

export interface Status {
  context: string
  type: 'success' | 'failure'
  description?: string
}

function append(obj: Matched, values: Matched): void {
  obj.add.push(...values.add)
  obj.remove.push(...values.remove)
}

export function getMatched(
  client: InstanceType<typeof GitHub>,
  config: LabelerConfig
): Matched {
  const labels: Matched = {
    add: [],
    remove: [],
    status: []
  }

  append(labels, title(client, config))

  // TODO(fuxing): get all matched conditions then generate add/remove/status

  // Won't attempt to dedupe remove from add, as it is a user labeler.config error.
  return {
    add: uniq(labels.add),
    remove: uniq(labels.remove),
    status: uniqBy(labels.status, 'context')
  }
}
