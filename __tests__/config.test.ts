import {LabelerConfig, parse} from '../src/config'
import fs from 'fs'

function parseConfig(path: string) {
  const content = fs.readFileSync(`./__tests__/fixtures/${path}`, 'utf8')
  return parse(content)
}

describe('config valid', () => {
  it('should parse basic.yml', function () {
    expect(() => parseConfig('basic.yml')).not.toThrowError()
  })

  it('should parse group.yml', function () {
    expect(() => parseConfig('group.yml')).not.toThrowError()
  })

  it('should parse wip.yml', function () {
    expect(() => parseConfig('wip.yml')).not.toThrowError()
  })
})

describe('config invalid', () => {
  it('empty.yml', function () {
    expect(() => parseConfig('invalid/empty.yml')).toThrow(
      /labeler\.yml parse error: .+ at labels but instead got: null/
    )
  })

  it('escape.yml', function () {
    expect(() => parseConfig('invalid/escape.yml')).toThrow(
      /unknown escape sequence at .+/
    )
  })

  it('group.yml', function () {
    expect(() => parseConfig('invalid/group.yml')).toThrow(
      /labeler\.yml parse error: .*/
    )
  })

  it('indent.yml', function () {
    expect(() => parseConfig('invalid/indent.yml')).toThrow(
      /bad indentation of a mapping entry at .+/
    )
  })

  it('label.yml', function () {
    expect(() => parseConfig('invalid/label.yml')).toThrow(
      /labeler\.yml parse error: .*/
    )
  })

  it('matcher.yml', function () {
    expect(() => parseConfig('invalid/matcher.yml')).toThrow(
      /labeler\.yml parse error: .*/
    )
  })

  it('status.yml', function () {
    expect(() => parseConfig('invalid/status.yml')).toThrow(
      /labeler\.yml parse error: .*/
    )
  })

  it('version.yml', function () {
    expect(() => parseConfig('invalid/version.yml')).toThrow(
      'labeler.yml parse error: Expecting "v1" at version but instead got: "v100"'
    )
  })
})
