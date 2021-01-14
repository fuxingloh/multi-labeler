import {GitHub} from '@actions/github/lib/utils'

import {uniq} from 'lodash'
import {Config} from '../config'

import title from './title'
import body from './body'

export interface Matched {
  append: string[]
}

function append(obj: Matched, matched?: Matched): void {
  obj.append.push(...(matched?.append || []))
}

export function getMatched(
  client: InstanceType<typeof GitHub>,
  config: Config
): Matched {
  const labels: Matched = {
    append: []
  }

  append(labels, title(client, config))
  append(labels, body(client, config))

  return {
    append: uniq(labels.append)
  }
}
