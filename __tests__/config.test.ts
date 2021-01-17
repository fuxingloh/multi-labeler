import {Config, parse} from '../src/config'
import fs from 'fs'

function parseConfig(path: string): Config {
  const content = fs.readFileSync(`./__tests__/fixtures/${path}`, 'utf8')
  return parse(content)
}

describe('valid config', () => {
  it('basic.yml', function () {
    expect(() => parseConfig('basic.yml')).not.toThrowError()
  })

  it('checks.yml', function () {
    expect(() => parseConfig('checks.yml')).not.toThrowError()
  })

  it('checks-basic.yml', function () {
    expect(() => parseConfig('checks-basic.yml')).not.toThrowError()
  })

  it('empty.yml', function () {
    expect(() => parseConfig('empty.yml')).not.toThrowError()
  })

  it('labels.yml', function () {
    expect(() => parseConfig('labels.yml')).not.toThrowError()
  })

  it('semantic-release.yml', function () {
    expect(() => parseConfig('semantic-release.yml')).not.toThrowError()
  })
})

describe('invalid checks', () => {
  it('checks-all-invalid.yml', function () {
    expect(() => parseConfig('invalid/checks-all-invalid.yml')).toThrow(
      /labeler\.yml parse error:/
    )
  })

  it('checks-any-invalid.yml', function () {
    expect(() => parseConfig('invalid/checks-any-invalid.yml')).toThrow(
      /labeler\.yml parse error:/
    )
  })

  it('checks-context-invalid.yml', function () {
    expect(() => parseConfig('invalid/checks-context-invalid.yml')).toThrow(
      /labeler\.yml parse error:/
    )
  })

  it('checks-context-missing.yml', function () {
    expect(() => parseConfig('invalid/checks-context-missing.yml')).toThrow(
      /labeler\.yml parse error:/
    )
  })

  it('checks-empty.yml', function () {
    expect(() => parseConfig('invalid/checks-empty.yml')).toThrow(
      /labeler\.yml parse error:/
    )
  })

  it('checks-url-invalid.yml', function () {
    expect(() => parseConfig('invalid/checks-url-invalid.yml')).toThrow(
      /labeler\.yml parse error:/
    )
  })
})

describe('invalid labels', () => {
  it('labels-empty.yml', function () {
    expect(() => parseConfig('invalid/labels-empty.yml')).toThrow(
      /labeler\.yml parse error:/
    )
  })

  it('malformed-escaping.yml', function () {
    expect(() => parseConfig('invalid/malformed-escaping.yml')).toThrow(
      /unknown escape sequence at .+/
    )
  })

  it('malformed-indent.yml', function () {
    expect(() => parseConfig('invalid/malformed-indent.yml')).toThrow(
      /bad indentation of a mapping entry at .+/
    )
  })

  it('version-invalid.yml', function () {
    expect(() => parseConfig('invalid/version-invalid.yml')).toThrow(
      'labeler.yml parse error:\\nExpecting "v1" at 0.version but instead got: "v100"'
    )
  })
})

describe('invalid labels matcher', () => {
  it('matcher-body-invalid.yml', function () {
    expect(() => parseConfig('invalid/matcher-body-invalid.yml')).toThrow(
      /labeler\.yml parse error:/
    )
  })

  it('matcher-branch-invalid.yml', function () {
    expect(() => parseConfig('invalid/matcher-branch-invalid.yml')).toThrow(
      /labeler\.yml parse error:/
    )
  })

  it('matcher-comment-invalid.yml', function () {
    expect(() => parseConfig('invalid/matcher-comment-invalid.yml')).toThrow(
      /labeler\.yml parse error:/
    )
  })

  it('matcher-commits-invalid.yml', function () {
    expect(() => parseConfig('invalid/matcher-commits-invalid.yml')).toThrow(
      /labeler\.yml parse error:/
    )
  })

  it('matcher-files-invalid.yml', function () {
    expect(() => parseConfig('invalid/matcher-files-invalid.yml')).toThrow(
      /labeler\.yml parse error:/
    )
  })

  it('matcher-title-invalid.yml', function () {
    expect(() => parseConfig('invalid/matcher-title-invalid.yml')).toThrow(
      /labeler\.yml parse error:/
    )
  })
})
