# Developer Workflow Guide

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

---

## Available Scripts

### Development

| Command              | Description                              |
| -------------------- | ---------------------------------------- |
| `pnpm dev`           | Start development server with hot-reload |
| `pnpm build`         | Build for production                     |
| `pnpm build:analyze` | Build and analyze bundle size            |

### Testing

| Command              | Description                    |
| -------------------- | ------------------------------ |
| `pnpm test`          | Run tests in watch mode        |
| `pnpm test:ui`       | Open visual test dashboard     |
| `pnpm test:run`      | Run tests once                 |
| `pnpm test:coverage` | Run tests with coverage report |

### Code Quality

| Command             | Description                     |
| ------------------- | ------------------------------- |
| `pnpm lint`         | Check code with ESLint          |
| `pnpm lint:fix`     | Fix ESLint errors automatically |
| `pnpm format`       | Format code with Prettier       |
| `pnpm format:check` | Check code formatting           |

---

## Git Workflow

### Commit Message Format

We use conventional commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code refactoring
- `perf:` Performance improvement
- `test:` Tests
- `chore:` Maintenance

**Examples:**

```bash
feat(auth): add Firebase Custom Claims support
fix(router): resolve duplicate guard issue
docs: update deployment guide
refactor(components): extract HeroSection component
```

### Pre-commit Hooks

The following checks run automatically before each commit:

- ✅ ESLint check
- ✅ Prettier format check
- ✅ Test suite (quick run)

If any check fails, the commit will be blocked.

---

## Development Best Practices

### 1. Component Structure

```vue
<template>
  <!-- Template code -->
</template>

<script>
// Imports
import {} from 'vue'

// Component definition
export default {
  name: 'ComponentName',
  // ...
}
</script>

<style lang="scss" scoped>
// Styles
</style>
```

### 2. Composable Pattern

```javascript
// src/composables/useExample.js
export function useExample() {
  // State
  const state = ref(null)

  // Methods
  const method = () => {}

  return { state, method }
}
```

### 3. Store Pattern

```javascript
// src/stores/example-store.js
export const useExampleStore = defineStore('example', {
  state: () => ({}),
  getters: {},
  actions: {},
})
```

---

## Debugging

### VS Code Setup

1. Install extensions:
   - Volar (Vue 3)
   - ESLint
   - Prettier
   - Vitest

2. Launch configuration (`.vscode/launch.json`):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug Chrome",
      "url": "http://localhost:9200",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

### Browser DevTools

- Vue DevTools for component inspection
- Console for debugging
- Network tab for API calls
- Performance tab for profiling

---

## Testing Guidelines

### Unit Tests

```javascript
// src/composables/useExample.test.js
import { describe, it, expect } from 'vitest'
import { useExample } from 'src-composables/useExample'

describe('useExample', () => {
  it('should work', () => {
    const result = useExample()
    expect(result).toBeDefined()
  })
})
```

### Component Tests

```javascript
// src/components/Example.test.js
import { mount } from '@vue/test-utils'
import Example from 'src-components/Example.vue'

describe('Example', () => {
  it('renders', () => {
    const wrapper = mount(Example)
    expect(wrapper.exists()).toBe(true)
  })
})
```

---

## Code Review Checklist

Before submitting a PR:

- [ ] Code follows style guide
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No ESLint errors
- [ ] No console.log statements
- [ ] Build passes
- [ ] Tests pass

---

## Troubleshooting

### Common Issues

**Port already in use:**

```bash
# Kill process on port 9200
netstat -ano | findstr :9200
taskkill /PID <PID> /F
```

**Node modules issues:**

```bash
# Clean install
rm -rf node_modules
pnpm install
```

**Build fails:**

```bash
# Clear cache
pnpm clean  # if available
rm -rf dist
pnpm build
```

---

## Resources

- [Quasar Docs](https://quasar.dev/)
- [Vue 3 Docs](https://vuejs.org/)
- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)

---

## Getting Help

- Check existing issues in the repository
- Review documentation
- Ask in team channels
- Check error logs in console
