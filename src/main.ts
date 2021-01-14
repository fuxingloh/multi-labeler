import {run} from './labeler'
import * as core from "@actions/core";

const githubToken = core.getInput('github-token')
const configPath = core.getInput('config-path', {required: true})

run(githubToken, configPath)
  .catch(error => {
    core.error(error)
    core.setFailed(error.message)
  })
