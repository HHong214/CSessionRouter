# Building methods

Read this while planning, to mark which tasks use tests first or another method, and again when those tasks run.

## Tests first

Tests first is automatic for logic that can be tested: functions, APIs, data transforms, bug fixes. It is skipped for UI layout, config, docs and throwaway experiments. The plan says which tasks use it. `tdd` forces it wherever a test is possible.

1. **Test task.** One worker writes tests from the done criteria, runs them and shows they fail for the right reason.
2. **Lock.** First read the new tests' edge cases against the done criteria or the contract, working each literal expected value with the stated rules; a wrong case goes back to the test worker. When the tests call a typed interface, the test worker also type-checks its test file against the stated signatures, because a test runner may not type-check. Then you record the list of test files and their hashes. When that takes more than one command, have a cheap worker do it.
3. **Build task.** A different worker implements until the tests pass. Its brief names the locked test files, which it may not edit. If a test looks wrong, it returns `NEEDS-DECISION:` with the reason.
4. **Check.** The tests are re-run fresh by someone other than the builder. The output shows more than zero tests, all passing, and the test files' hashes are unchanged.
5. **Refactor** if needed, with the tests staying green. Then review (checks.md).

**Bug fix.** Reproduce the bug as a failing test first, then fix.

**A return that needs a new test.** When a confirmed finding is not covered by a locked test, a test worker adds the failing test first and you renew the lock. Only then does the builder get the return. A builder never writes the tests it is checked against.

## Methods used only when they fit

The plan says so when one of these is used.

- **Old code.** Before changing it, write tests that pin down how it behaves now, odd behaviour included.
- **Risky unknown.** A small throwaway experiment on a cheap model that answers one question. The code is discarded and the answer recorded in the plan.
- **Pure logic with clear rules** (parsers, converters, algorithms), when the language has a library for it: one to three property-based tests.
- **Critical logic.** A mutation check when a tool exists and the suite is fast. Otherwise the reviewer asks, for the three most important branches, whether the tests would notice if the condition were flipped.
