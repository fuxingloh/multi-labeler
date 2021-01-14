import {Config} from '../config'
import {GitHub} from '@actions/github/lib/utils'
import * as github from '@actions/github'
import {matcherRegexAny} from './utils'

export default async function match(
  client: InstanceType<typeof GitHub>,
  config: Config
): Promise<string[]> {
  const number = github.context.payload.pull_request?.number

  if (!number) {
    return []
  }

  const matchers = config.labels.filter(value => {
    return value.matcher?.commits
  })

  if (!matchers.length) {
    return []
  }

  const commits = await client.pulls.listCommits({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: number,
    per_page: 250
  })

  return matchers
    .filter(value => {
      return matcherRegexAny(
        value.matcher!.commits!,
        commits.data.map(c => c.commit.message)
      )
    })
    .map(value => value.label)
}
