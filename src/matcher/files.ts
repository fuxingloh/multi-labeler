import {Config} from '../config'
import {GitHub} from '@actions/github/lib/utils'
import * as github from '@actions/github'
import {Minimatch} from 'minimatch'

function anyMatch(globs: string[], files: string[]): boolean {
  const matchers = globs.map(g => new Minimatch(g))

  for (const file of files) {
    for (const matcher of matchers) {
      if (matcher.match(file)) {
        return true
      }
    }
  }

  return false
}

export default async function match(
  client: InstanceType<typeof GitHub>,
  config: Config
): Promise<string[]> {
  const pr_number = github.context.payload.pull_request?.number

  if (!pr_number) {
    return []
  }

  const matchers = config.labels.filter(value => {
    return value.matcher?.files
  })

  if (!matchers.length) {
    return []
  }

  const responses = await client.paginate(
    client.pulls.listFiles.endpoint.merge({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: pr_number
    })
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const files: string[] = responses.map((c: any) => c.filename)

  return matchers
    .filter(value => {
      const globs: string[] = Array.isArray(value.matcher!.files)
        ? value.matcher!.files
        : [value.matcher!.files as string]
      return anyMatch(globs, files)
    })
    .map(value => value.label)
}
