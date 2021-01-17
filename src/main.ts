import * as core from '@actions/core'
import * as github from '@actions/github'
import {labels} from './labeler'
import {getConfig} from './config'
import {checks, StatusCheck} from './checks'

const githubToken = core.getInput('github-token')
const configPath = core.getInput('config-path', {required: true})

const client = github.getOctokit(githubToken)
const payload =
  github.context.payload.pull_request || github.context.payload.issue

if (!payload?.number) {
  throw new Error(
    'Could not get issue_number from pull_request or issue from context'
  )
}

async function addLabels(labels: string[]): Promise<void> {
  core.setOutput('labels', labels)

  if (!labels.length) {
    return
  }

  await client.issues.addLabels({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: payload!.number,
    labels: labels
  })
}

async function addChecks(checks: StatusCheck[]): Promise<void> {
  if (!checks.length) {
    return
  }

  if (!github.context.payload.pull_request) {
    return
  }

  const sha = github.context.payload.pull_request?.head.sha as string
  await Promise.all([
    checks.map(check => {
      client.repos.createCommitStatus({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        sha: sha,
        context: check.context,
        state: check.state,
        description: check.description,
        target_url: check.url
      })
    })
  ])
}

getConfig(client, configPath)
  .then(async config => {
    const labeled = await labels(client, config)
    return Promise.all([
      addLabels(labeled),
      checks(client, config, labeled).then(checks => addChecks(checks))
    ])
  })
  .catch(error => {
    core.error(error)
    core.setFailed(error.message)
  })
