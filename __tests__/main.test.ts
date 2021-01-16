import fs from 'fs'
import {parse} from '../src/config'

it('.github/labeler.yml', function () {
  const content = fs.readFileSync(`.github/labeler.yml`, 'utf8')
  expect(() => parse(content)).not.toThrowError()
})
