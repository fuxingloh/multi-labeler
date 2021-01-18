import {matcherRegex} from "../../src/matcher/utils";

it('should always fail', function () {
  expect(matcherRegex({regex: undefined, text: 'abc'}))
    .toBeFalsy()
});
