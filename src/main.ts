import * as core from '@actions/core'
import * as github from '@actions/github'
import {labels} from './labeler'
import {getConfig} from './config'

const githubToken = core.getInput('github-token')
const configPath = core.getInput('config-path', {required: true})

const client = github.getOctokit(githubToken)
const payload =
  github.context.payload.pull_request || github.context.payload.issue

if (payload?.number) {
  throw new Error('Could not get issue_number from pull_request or issue from context');
}

getConfig(client, configPath)
  .then(config => labels(client, config))
  .then(async labels => {
    core.setOutput('labels', labels)

    if (labels.length) {
      await client.issues.addLabels({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: payload!.number,
        labels: labels
      })
    }
    return labels
  })
  .then(labels => {
    // TODO(fuxing): checks
  })
  .catch(error => {
    core.error(error)
    core.setFailed(error.message)
  })
