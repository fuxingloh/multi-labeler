import * as github from '@actions/github'
import {GitHub} from '@actions/github/lib/utils'
import {Config, parse} from './config'
import {getLabels} from './matcher'

async function getConfig(
  client: InstanceType<typeof GitHub>,
  configPath: string
): Promise<Config> {
  const response: any = await client.repos.getContent({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ref: github.context.sha,
    path: configPath
  })

  const content: string = await Buffer.from(
    response.data.content,
    response.data.encoding
  ).toString()
  return parse(content)
}

export async function run(
  githubToken: string,
  configPath: string
): Promise<string[]> {
  const client = github.getOctokit(githubToken)
  const config = await getConfig(client, configPath)
  const payload =
    github.context.payload.pull_request || github.context.payload.issue

  if (!payload?.number) {
    throw new Error(
      'Could not get issue_number from pull_request or issue from context'
    )
  }

  const labels: string[] = await getLabels(client, config)

  if (labels.length) {
    await client.issues.addLabels({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: payload!.number,
      labels: labels
    })
  }

  return labels
}
