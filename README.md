# Multi Labeler

Multi labeler for title, comments, description, commit messages or files.

## Usage

```yml
on:
  pull_request:

jobs:
  labeler:
    name: Labeler
    runs-on: ubuntu-latest
    steps:
      - uses: fuxingloh/multi-labeler@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}

```

- [ ] Various use case 

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

### PR/Issue Description: RegEx

```yml
version: v1

labels:
  - label: "bug"
    matcher:
      description: "- [x] bug"
```

## Features

- Append based multi-labeler, using `.github/labeler.yml` as config.
- Automatically fail if `labeler.yml` is malformed, type-checked.
- Regex Matcher:
  - PR/Issue title
  - PR/Issue description
  - PR/Issue comments
  - PR commit messages
  - PR branch name
- Glob Matcher:
  - Files

## Why?

> There are so many labeler why create another? 😧

1. I want a lightweight labeler that is written in TypeScript so that it don't have to build a docker image everytime it
   runs.
2. I want a simple match first append based multi-labeler without it being a turing complete solution.
3. I want to write my rules with `.github/labeler.yml` for a single source of label truth.
4. I want to use it together with [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
5. I don't want it to do anything else, labels only.
    1. Assume you are using GitHub branch protection (labels only).
    2. I want to run this in PR triage before everything else (labels only).
    3. Chain this action with another action; this should just be for (labels only). 
