import * as core from '@actions/core'
import * as github from '@actions/github'
import {labels, mergeLabels} from './labeler'
import {Config, getConfig} from './config'
import {checks, StatusCheck} from './checks'

const githubToken = core.getInput('github-token')
let configPath: string | undefined = core.getInput('config-path')
let remoteConfigPath: string | undefined = core.getInput('remote-config-path')
console.log(`configPath: ${configPath}`)
console.log(`remoteConfigPath: ${remoteConfigPath}`)
if (configPath === '' && remoteConfigPath === '') {
  throw new Error('Valid config-path or remote-config-path are required')
} else if (remoteConfigPath !== '') {
  configPath = undefined
} else {
  remoteConfigPath = undefined
}
console.log(`configPath: ${configPath}`)
console.log(`remoteConfigPath: ${remoteConfigPath}`)

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
    labels
  })
}

async function removeLabels(
  labels: string[],
  config: Config
): Promise<unknown[]> {
  const eventName = github.context.eventName
  if (!['pull_request', 'pull_request_target', 'issue'].includes(eventName)) {
    return []
  }

  return Promise.all(
    (config.labels || [])
      .filter(label => {
        // Is sync, not matched in final set of labels
        return label.sync && !labels.includes(label.label)
      })
      .map(label => {
        return client.issues
          .removeLabel({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: payload!.number,
            name: label.label
          })
          .catch(ignored => {
            return undefined
          })
      })
  )
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
        sha,
        context: check.context,
        state: check.state,
        description: check.description,
        target_url: check.url
      })
    })
  ])
}

getConfig(client, configPath, remoteConfigPath)
  .then(async config => {
    const labeled = await labels(client, config)
    const finalLabels = mergeLabels(labeled, config)

    return Promise.all([
      addLabels(finalLabels),
      removeLabels(finalLabels, config),
      checks(client, config, finalLabels).then(checks => addChecks(checks))
    ])
  })
  .catch(error => {
    core.error(error)
    core.setFailed(error.message)
  })
