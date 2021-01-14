import * as core from '@actions/core'
import * as github from '@actions/github'
import {GitHub} from '@actions/github/lib/utils'
import {LabelerConfig, parse} from './config'
import {Matched, getMatched} from './matcher'

async function getConfig(
  client: InstanceType<typeof GitHub>,
  configPath: string
): Promise<LabelerConfig> {
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

export async function run(): Promise<void> {
  try {
    const token = core.getInput('github-token', {required: true})
    const client = github.getOctokit(token)

    const configPath = core.getInput('config-path', {required: true})
    const pullRequest = github.context.payload.pull_request

    if (!pullRequest?.number) {
      console.log('Could not get pull request number from context, exiting')
      return
    }

    const config = await getConfig(client, configPath)
    const labels: Matched = getMatched(client, config)

    if (labels.remove) {
      await Promise.all(
        labels.remove.map(label =>
          client.issues.removeLabel({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: pullRequest.number,
            name: label
          })
        )
      )
    }

    if (labels.add) {
      await client.issues.addLabels({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: pullRequest.number,
        labels: labels.add
      })
    }

    // TODO(fuxing): status messages
  } catch (error) {
    core.error(error)
    core.setFailed(error.message)
  }
}
