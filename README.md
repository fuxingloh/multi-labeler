# Multi Labeler

[![codecov](https://codecov.io/gh/fuxingloh/multi-labeler/branch/main/graph/badge.svg?token=SOWIV1VVM1)](https://codecov.io/gh/fuxingloh/multi-labeler)
[![Release](https://img.shields.io/github/v/release/fuxingloh/mutli-labeler)](https://github.com/fuxingloh/multi-labeler/releases)
[![License MIT](https://img.shields.io/github/license/fuxingloh/vue-horizontal)](https://github.com/fuxingloh/vue-horizontal/blob/main/LICENSE)

Multi labeler for title, body, comments, commit messages, branch or files.

## Features

- Append based multi-labeler, using `.github/labeler.yml` as config.
- Automatically fail if `labeler.yml` is malformed, type-checked.
- Regex Matcher:
  - PR/Issue title
  - PR/Issue body
  - PR/Issue comments
  - PR commit messages
  - PR branch name
- Glob Matcher:
  - Files

## Usage

```yml
on:
  pull_request:
  issues:
  issue_comment:

jobs:
  labeler:
    name: Labeler
    runs-on: ubuntu-latest
    steps:
      - uses: fuxingloh/multi-labeler@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Examples

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
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
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
    types: [opened, edited]

jobs:
  labeler:
    name: Labeler
    runs-on: ubuntu-latest
    steps:
      - uses: fuxingloh/multi-labeler@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
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
    types: [created, edited]

jobs:
  labeler:
    name: Labeler
    runs-on: ubuntu-latest
    steps:
      - uses: fuxingloh/multi-labeler@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
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
file to the repository.

## Matchers

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
      body: "(\\n|.)*- \\[x\\] bug(\\n|.)*"
```

### PR/Issue Comment: Regex

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

### PR Files: [Glob Matcher](https://github.com/isaacs/minimatch)

Maximum of 3000 files only. If you use this to audit changes, take note of the 3000 files limitation.

```yml
version: v1

labels:
  - label: "github"
    matcher:
      files: ".github/**"

  - label: "security"
    matcher:
      files: [ "web/security/**", "security/**" ]
```

## Why?

> There are so many labeler why create another? 😧

1. I want a lightweight labeler that is written in TypeScript so that it don't have to build a docker image everytime it
   runs.
2. I want a simple match first append based multi-labeler without it being a turing complete solution.
3. I want to write my rules with `.github/labeler.yml` for a single source of label truth.
4. I don't want it to do anything else, labels only.
    1. Assume you are using GitHub branch protection (labels only).
    2. I want to run this in PR triage before everything else (labels only).
    3. Chain this action with another action; this should just be for (labels only). 
