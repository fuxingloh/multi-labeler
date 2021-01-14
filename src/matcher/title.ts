import {Matched} from './'
import {Config} from '../config'
import {GitHub} from '@actions/github/lib/utils'

export default function match(
  /* eslint-disable @typescript-eslint/no-unused-vars */
  client: InstanceType<typeof GitHub>,
  config: Config
): Matched {
  return {
    append: [],
  }
}
