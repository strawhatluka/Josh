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
# Format all files
npm run format

# Check formatting without making changes
npm run format:check

# Run linter
npm run lint

# Run linter and auto-fix issues
npm run lint:fix
```

## How It Works

When you run `git commit`, the pre-commit hook automatically:

1. Runs ESLint on staged `.js` files and fixes auto-fixable issues
2. Runs Prettier on staged files (JS, JSON, CSS, HTML) and formats them
3. Stages the formatted/fixed files
4. Proceeds with the commit if all checks pass

## Testing the Pre-Commit Hook

To test the pre-commit hook without committing:

```bash
# Stage some files
git add .

# Run lint-staged manually
npx lint-staged
```

## Current Linting Warnings

The linter currently shows warnings for:

- Unused variables in catch blocks (can be prefixed with `_` to ignore)
- Functions defined in HTML onclick attributes (editPhoto, deletePhoto, editMemory, deleteMemory)

These are warnings only and won't block commits.

## Bypassing Pre-Commit Hooks

If you need to commit without running hooks (not recommended):

```bash
git commit --no-verify -m "your message"
```
