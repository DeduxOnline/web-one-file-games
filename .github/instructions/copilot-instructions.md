# Project instructions for Copilot (Vanilla JS ES2022)

You are working in a Vanilla JavaScript (ES2022) codebase.
Follow these rules:

- Use modern ES2022 syntax. Prefer async/await over raw promises.
- Keep functions small and single-purpose. Avoid long functions and deep nesting.
- Prefer pure functions when possible.
- Always add input validation for public functions.
- Do not introduce new dependencies unless explicitly asked.
- When creating new code, also create/update Jest unit tests.
- If tests fail, fix production code first, then tests.
- For web/UI behavior changes, add or update Playwright tests when applicable.
- If Sonar/Snyk reports issues, treat them as requirements: fix or justify with a short comment.
- Output must be deterministic and reproducible.

When asked to implement something:

1. explain intended changes briefly,
2. implement minimal code,
3. add tests,
4. show commands to run (npm test, npx playwright test),
5. iterate until green.
