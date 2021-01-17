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

describe('invalid config', () => {
  it('labels-empty.yml', function () {
    expect(() => parseConfig('invalid/labels-empty.yml')).toThrow(
      /labeler\.yml parse error:/
    )
  })

  it('labels-missing.yml', function () {
    expect(() => parseConfig('invalid/labels-missing.yml')).toThrow(
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
      'labeler.yml parse error:\\nExpecting "v1" at version but instead got: "v100"'
    )
  })
})

describe('invalid matcher', () => {
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
