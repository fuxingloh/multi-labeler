# Multi Labeler

[![codecov](https://codecov.io/gh/fuxingloh/multi-labeler/branch/main/graph/badge.svg?token=SOWIV1VVM1)](https://codecov.io/gh/fuxingloh/multi-labeler)
[![CodeFactor](https://www.codefactor.io/repository/github/fuxingloh/multi-labeler/badge)](https://www.codefactor.io/repository/github/fuxingloh/multi-labeler)
[![Release](https://img.shields.io/github/v/release/fuxingloh/multi-labeler)](https://github.com/fuxingloh/multi-labeler/releases)
[![License MIT](https://img.shields.io/github/license/fuxingloh/multi-labeler)](https://github.com/fuxingloh/multi-labeler/blob/main/LICENSE)

Multi labeler for title, body, comments, commit messages, branch, author or files. Optionally, generate a status check
based on the labels.

[Who is using `fuxingloh/multi-labeler`?](https://github.com/search?o=desc&q=fuxingloh+%2F+multi-labeler&s=indexed&type=Code)

## Features

- Single compiled javascript file, extremely fast. Use fewer credits!
- Append based multi-labeler, using `.github/labeler.yml` as config.
- Automatically fail if `labeler.yml` is malformed, type-checked.
- Set label to sync for conditional labeling, removed if condition failed.
- Regex Matcher:
  - PR/Issue title
  - PR/Issue body
  - PR/Issue comments
  - PR commit messages
  - PR branch name
- File Matcher:
  - Files count
  - Files any glob match
  - Files all glob match
- Author Matcher
- Generate status checks:
  - Any label match
  - All label match

## Usage

#### `.github/workflow/labeler.yml`

```yml
on:
  pull_request_target: # for OSS with public contributions (forked PR)   
  pull_request:
  # Useful for triaging code review, and generate compliance status check.
  # Semantic release? Done.
  # Make a file change in a mono repo. Tag the mono repo getting changed to generate better release!

  issues:
  # Useful for triaging error!
  # '- [x] Is this a bug?' = 'bug' label!

  issue_comment:
  # To pickup comment body in pr or issue and generate a label. 
  # Imagine someone comment 'Me too, I get TimeoutException from ...' in comment body. 
  # Generate a 'bug/timeout' label for better triaging!

permissions:
  # Setting up permissions in the workflow to limit the scope of what it can do. Optional!
  contents: read
  issues: write
  pull-requests: write
  statuses: write
  checks: write

jobs:
  labeler:
    name: Labeler
    runs-on: ubuntu-latest
    steps:
      # follows semantic versioning. Lock to different version: v1, v1.5, v1.5.0 or use a commit hash.
      - uses: fuxingloh/multi-labeler@v1
        with:
          github-token: ${{secrets.GITHUB_TOKEN}} # optional, default to '${{ github.token }}'  
          config-path: .github/labeler.yml # optional, default to '.github/labeler.yml'
          config-repo: my-org/my-repo # optional, default to '${{ github.repository }}'
```

#### `.github/labeler.yml`

```yml
# .github/labeler.yml

version: v1

labels:
  - label: "feat"
    sync: true # remove label if match failed, default: false (pull_request/issue only)
    matcher:
      # Matcher will match on any 7 matcher
      title: "^feat:.*"
      body: "/feat"
      comment: "/feat"
      branch: "^feat/.*"
      commits: "^feat:.*"
      author:
        - github-actions
        - fuxingloh
      files:
        any: [ "app/*" ]
        all: [ "!app/config/**" ]
        count:
          gte: 1
          lte: 1000

# Optional, if you want labels to generate a success/failure status check
checks:
  - context: "Status Check"
    url: "https://go.to/detail"
    description:
      success: "Ready for review & merge."
      failure: "Missing labels for release."
    labels:
      any:
        - any
        - have
      all:
        - all
        - must
        - have
```

### Examples

<details>
  <summary>Semantic Pull Request</summary>

#### `.github/workflow/pr-triage.yml`

```yml
on:
  pull_request:
    types: [ opened, edited, synchronize, ready_for_review ]
    branches: [ master, main ]

jobs:
  labeler:
    name: Labeler
    runs-on: ubuntu-latest
    steps:
      - uses: fuxingloh/multi-labeler@v1
```

#### `.github/labeler.yml`

```yml
version: v1

labels:
  - label: "feat"
    matcher:
      title: "^feat: .*"
      commits: "^feat: .*"

  - label: "fix"
    matcher:
      title: "^fix: .*"
      commits: "^fix: .*"

  - label: "chore"
    matcher:
      title: "^chore: .*"
      commits: "^chore: .*"

  - label: "docs"
    matcher:
      title: "^docs: .*"
      commits: "^docs: .*"

checks:
  - context: "Semantic Pull Request"
    url: "https://github.com/fuxingloh/multi-labeler/blob/main/.github/labeler.yml"
    description:
      success: Ready for review & merge.
      failure: Missing semantic label for merge.
    labels:
      any:
        - feat
        - fix
        - chore
        - docs
```

</details>

<details>
  <summary>PR Triage</summary>

#### `.github/workflow/pr-triage.yml`

```yml
on:
  pull_request:
    types: [ opened, edited, synchronize, ready_for_review ]
    branches: [ master, main ]

jobs:
  labeler:
    name: Labeler
    runs-on: ubuntu-latest
    steps:
      - uses: fuxingloh/multi-labeler@v1
```

#### `.github/labeler.yml`

```yml
version: v1

labels:
  - label: "feat"
    matcher:
      title: "^feat:.*"
      branch: "^feat/.*"
      commits: "^feat:.*"

  - label: "fix"
    matcher:
      title: "^fix:.*"
      branch: "^fix/.*"
      commits: "^fix:.*"
```

</details>

<details>
  <summary>Issue Triage</summary>

#### `.github/workflow/issue-triage.yml`

```yml
on:
  issues:
    types: [ opened, edited ]

jobs:
  labeler:
    name: Labeler
    runs-on: ubuntu-latest
    steps:
      - uses: fuxingloh/multi-labeler@v1
```

#### `.github/labeler.yml`

```yml
version: v1

labels:
  - label: "bug"
    matcher:
      body: "(\\n|.)*- \\[x\\] bug(\\n|.)*"
```

</details>

<details>
  <summary>Comment Triage</summary>

#### `.github/workflow/comment-slash.yml`

```yml
on:
  issue_comment:
    types: [ created, edited ]

jobs:
  labeler:
    name: Labeler
    runs-on: ubuntu-latest
    steps:
      - uses: fuxingloh/multi-labeler@v1
```

#### `.github/labeler.yml`

```yml
version: v1

labels:
  - label: "coverage"
    matcher:
      comment: "# \\[Codecov\\] .*"

  - label: "stale"
    matcher:
      comment: "/stale"
```

</details>

## Configuration

Once you’ve added multi-labeler to your repository, it must be enabled by adding a `.github/labeler.yml` configuration
file to the repository. If you want to use a configuration file shared across multiple repositories, you can set the
`config-repo` input to point to a different repository. However, make sure to set a `github-token` that has permissions
to access the provided repository, as the default `GITHUB_TOKEN` only has access to the repository the action is 
running in.

## Matchers

> RegEx matcher requires backslash '\' to be double slashed '\\'. Hence, to match brackets '()' you need a regex of '\\(\\)'. See https://github.com/fuxingloh/multi-labeler/issues/103

### PR/Issue Title: RegEx

```yml
version: v1

labels:
  - label: "feat"
    matcher:
      title: "^feat:.*"
```

### PR/Issue Body: RegEx

```yml
version: v1

labels:
  - label: "bug"
    matcher:
      # e.g. '- [x] bug'
      body: "(\\n|.)*- \\[x\\] bug(\\n|.)*"
```

### PR/Issue Comment: RegEx

```yml
version: v1

labels:
  - label: "stale"
    matcher:
      comment: "/stale"
```

### PR Branch: RegEx

```yml
version: v1

labels:
  - label: "feat"
    matcher:
      branch: "^feat/.*"
```

### PR Commits: RegEx

Check all commits and find any match, max of 250 commits only.

```yml
version: v1

labels:
  - label: "feat"
    matcher:
      commits: "^feat: .*"
```

### PR/Issue Author

Check for pr or issue author match.

```yml
version: v1

labels:
  - label: "single"
    matcher:
      author: "fuxingloh"
  - label: "any"
    matcher:
      author:
        - adam
        - claire
```

### PR Files: [Glob Matcher](https://github.com/isaacs/minimatch)

Maximum of 3000 files only. If you use this to audit changes, take note of the 3000 files limitation. Matcher within
files are 'and condition', all must match.

#### PR Files Basic

```yml
version: v1

labels:
  - label: "github"
    sync: true
    matcher:
      # This is shorthand for any: [".github/**"]
      files: ".github/**"

  - label: "security"
    sync: true
    matcher:
      # This is shorthand for any: ["web/security/**", "security/**"]
      files: [ "web/security/**", "security/**" ]
```

#### PR Files Count

```yml
version: v1

labels:
  - label: "size: s"
    sync: true
    matcher:
      files:
        count:
          gte: 1
          lte: 4

  - label: "size: m"
    sync: true
    matcher:
      files:
        count:
          gte: 5
          lte: 10

  - label: "size: l"
    sync: true
    matcher:
      files:
        count:
          gte: 11
```

#### PR Files Any & All

```yml
version: v1

labels:
  - label: "ci"
    sync: true
    matcher:
      files:
        any: [ ".github/workflow/**", ".circleci/**" ]
        all: [ "!app/**" ]

  - label: "attention"
    sync: true
    matcher:
      files:
        any: [ "app/**" ]
        count:
          neq: 1
```

### PR Status Checks

#### PR Check any

```yml
version: v1

checks:
  - context: "Release Drafter"
    url: "https://go.to/detail"
    description:
      success: "Ready for review & merge."
      failure: "Missing labels for release."
    labels:
      any:
        - feat
        - fix
        - chore
        - docs 
```

#### PR Check any + all

```yml
version: v1

checks:
  - context: "Merge check"
    description: "Labels for merge."
    labels:
      any: [ "reviewed", "size:s" ]
      all: [ "app" ]
```

#### PR Check none

```yml
version: v1

checks:
  - context: "Merge check"
    description: "Disable merging when 'DO NOT MERGE' label is set"
    labels:
      none: [ "DO NOT MERGE" ]
```

## Why?

> There are so many labeler why create another? 😧

1. I want a lightweight labeler that is written in TypeScript so that it don't have to build a docker image everytime it  runs.
2. I want a simple match first append based multi-labeler without it being a turing complete solution.
3. I want to write my rules with `.github/labeler.yml` for a single source of label truth.
4. I don't want it to do anything else, labels only.
   1. Assume you are using GitHub branch protection (labels only).
   2. I want to run this in PR triage before everything else (labels only).
   3. Chain this action with another action; this should just be for (labels only). 
