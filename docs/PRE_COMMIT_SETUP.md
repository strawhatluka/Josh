# Pre-Commit Setup

This project uses pre-commit hooks to ensure code quality before commits.

## Tools Installed

- **Prettier**: Code formatter for consistent styling
- **ESLint**: JavaScript linter for catching errors and enforcing best practices
- **Husky**: Git hooks manager
- **lint-staged**: Run linters only on staged files

## Configuration Files

- `.prettierrc` - Prettier configuration (semicolons, single quotes, 100 char width)
- `.prettierignore` - Files to exclude from formatting
- `eslint.config.js` - ESLint flat config (ESLint 9+)
- `.husky/pre-commit` - Pre-commit hook script
- `package.json` - Scripts and lint-staged configuration

## Available Scripts

```bash
# Format all files (JS, JSON, CSS, HTML, Markdown)
npm run format

# Check formatting without making changes
npm run format:check

# Run linter
npm run lint

# Run linter and auto-fix issues
npm run lint:fix

# Typecheck the JS codebase (tsc --noEmit with checkJs)
npm run typecheck

# Run the Jest test suite
npm test

# Run tests with coverage report (enforces 80% threshold)
npm run test:coverage
```

## How It Works

When you run `git commit`, the pre-commit hook automatically:

1. Runs ESLint on staged `.js` files and fixes auto-fixable issues
2. Runs Prettier on staged files (JS, JSON, CSS, HTML, MD) and formats them
3. Stages the formatted/fixed files
4. Proceeds with the commit if all checks pass

> **Note:** the pre-commit hook does NOT run `test` or `typecheck` — those are enforced by CI instead (see `.github/workflows/ci.yml`). Keeping the hook fast avoids slowing down every commit.

## Testing the Pre-Commit Hook

To test the pre-commit hook without committing:

```bash
# Stage some files
git add .

# Run lint-staged manually
npx lint-staged
```

## Linting Rules of Note

A few specific conventions baked into `eslint.config.js`:

- Unused catch-clause bindings and unused function args are permitted when prefixed with `_` (`caughtErrorsIgnorePattern` + `argsIgnorePattern: '^_'`).
- Functions called from inline `onclick=` handlers in HTML (e.g. `editPhoto`, `deletePhoto`, `editMemory`, `deleteMemory`) are explicitly attached to `window` in `public/js/admin.js` so ESLint sees their usage.
- Test files (`tests/**/*.js`, `**/*.test.js`) get a dedicated config block that injects Jest globals (`describe`, `it`, `expect`, `beforeEach`, etc.).

## Bypassing Pre-Commit Hooks

If you need to commit without running hooks (not recommended):

```bash
git commit --no-verify -m "your message"
```
