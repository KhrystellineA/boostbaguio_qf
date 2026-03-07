# Testing Guide - Boost Baguio

## Overview

This guide covers the testing infrastructure for the Boost Baguio project, including how to run tests, write new tests, and understand the testing setup.

---

## Quick Start

```bash
# Run tests in watch mode (recommended for development)
pnpm test

# Run tests once
pnpm test:run

# Run tests with coverage report
pnpm test:coverage

# Open test UI dashboard
pnpm test:ui
```

---

## Testing Stack

| Tool | Purpose |
|------|---------|
| **Vitest** | Test runner and assertion library |
| **Vue Test Utils** | Vue component testing utilities |
| **Testing Library Vue** | Component testing with user-centric approach |
| **jsdom** | Browser-like environment for tests |
| **@vitest/ui** | Visual test dashboard |

---

## Test Commands

### `pnpm test`
Runs tests in **watch mode**. Tests re-run automatically when you save changes. Best for development.

### `pnpm test:run`
Runs tests **once** and exits. Used in CI/CD pipelines.

### `pnpm test:coverage`
Runs tests and generates a **coverage report** in `test-report/coverage/`.

### `pnpm test:ui`
Opens the **Vitest UI dashboard** at `http://localhost:51204/__vitest__/` for visual test exploration.

---

## File Structure

```
src/
├── test/
│   ├── setup.js           # Global test setup and mocks
│   └── utils.js           # Test utility functions
├── composables/
│   ├── useAdminClaims.js
│   └── useAdminClaims.test.js    # Tests for composable
├── stores/
│   ├── user-store.js
│   └── user-store.test.js        # Tests for store
└── components/
    ├── PineSkeletonLoader.vue
    ├── PineSkeletonLoader.test.js # Tests for component
    └── ErrorBoundary.vue
    └── ErrorBoundary.test.js      # Tests for component
```

---

## Writing Tests

### Test File Naming

Test files should be named: `*.test.js` or `*.spec.js`

Example:
- `useAdminClaims.test.js`
- `user-store.test.js`
- `PineSkeletonLoader.test.js`

---

### Testing Composables

```javascript
// src/composables/useExample.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useExample } from 'src-composables/useExample'

describe('useExample', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return expected value', async () => {
    const result = await useExample()
    expect(result).toBeDefined()
  })

  it('should handle error case', async () => {
    // Mock error scenario
    const result = await useExample()
    expect(result).toBeNull()
  })
})
```

**Key Points:**
- Use `describe` to group related tests
- Use `beforeEach` to reset mocks/state
- Test both success and error cases
- Mock external dependencies (Firebase, API calls)

---

### Testing Stores (Pinia)

```javascript
// src/stores/example-store.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useExampleStore } from 'src-stores/example-store'

// Mock Firebase
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
}))

describe('Example Store', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useExampleStore()
  })

  it('starts with default state', () => {
    expect(store.loading).toBe(true)
  })

  it('should sign in successfully', async () => {
    const result = await store.signIn('test@example.com', 'password')
    expect(result.success).toBe(true)
  })

  it('should handle sign in error', async () => {
    const result = await store.signIn('invalid', 'password')
    expect(result.success).toBe(false)
  })
})
```

**Key Points:**
- Always call `setActivePinia(createPinia())` before each test
- Mock Firebase/AWS/external services
- Test state changes
- Test both success and error paths

---

### Testing Components

```javascript
// src/components/ExampleComponent.test.js
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ExampleComponent from 'src-components/ExampleComponent.vue'

describe('ExampleComponent', () => {
  it('renders correctly', () => {
    const wrapper = mount(ExampleComponent)
    expect(wrapper.classes()).toContain('example-component')
  })

  it('accepts props', () => {
    const wrapper = mount(ExampleComponent, {
      props: {
        title: 'Test Title'
      }
    })
    expect(wrapper.props('title')).toBe('Test Title')
  })

  it('emits events', async () => {
    const wrapper = mount(ExampleComponent)
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('shows error state', async () => {
    const wrapper = mount(ExampleComponent)
    wrapper.vm.triggerError(new Error('Test'))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.error-state').exists()).toBe(true)
  })
})
```

**Key Points:**
- Use `mount` for full component rendering
- Test props, events, and slots
- Test different states (loading, error, success)
- Use `await wrapper.vm.$nextTick()` for async updates

---

## Mocking

### Firebase Mocks

Firebase is automatically mocked in `src/test/setup.js`. To customize:

```javascript
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn().mockResolvedValue({
    user: { uid: 'test-uid', email: 'test@example.com' }
  }),
}))
```

### Quasar Mocks

Quasar components and plugins are mocked globally. For specific mocks:

```javascript
vi.mock('quasar', () => ({
  Notify: {
    create: vi.fn(),
  },
  useQuasar: () => ({
    notify: vi.fn(),
  }),
}))
```

### Router Mocks

```javascript
import { createRouter, createMemoryHistory } from 'vue-router'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/', component: {} }],
})

const wrapper = mount(Component, {
  global: {
    plugins: [router],
  },
})
```

---

## Test Utilities

### Available in `src/test/utils.js`

```javascript
import {
  createTestApp,
  renderWithQuasar,
  mockNotify,
  fireEvent,
  waitForElement,
  getTextContent,
  hasClass,
  findByText,
  mockAuthState,
} from 'src/test/utils'
```

### Global Helpers (in `src/test/setup.js`)

```javascript
// Create mock Firebase user
mockFirebaseUser({ uid: 'custom-uid', email: 'custom@example.com' })

// Create mock Firestore document
mockFirestoreDoc({ name: 'Test', category: 'test' })

// Create mock Firestore snapshot
mockFirestoreSnapshot([doc1, doc2])

// Wait for async operations
await waitForAsyncOperations()
```

---

## Best Practices

### ✅ DO:

1. **Test behavior, not implementation**
   ```javascript
   // ✅ Good: Tests what user sees
   expect(wrapper.text()).toContain('Success')
   
   // ❌ Bad: Tests internal state
   expect(wrapper.vm.internalCounter).toBe(1)
   ```

2. **Use descriptive test names**
   ```javascript
   // ✅ Good
   it('returns false when user is not authenticated')
   
   // ❌ Bad
   it('test auth')
   ```

3. **Clean up after tests**
   ```javascript
   beforeEach(() => {
     vi.clearAllMocks()
   })
   ```

4. **Test edge cases**
   - Empty states
   - Error states
   - Loading states
   - Boundary values

5. **Mock external services**
   - Firebase
   - API calls
   - LocalStorage
   - Timers

### ❌ DON'T:

1. **Don't test implementation details**
2. **Don't skip tests in production**
3. **Don't use setTimeout in tests** (use `vi.runAllTimersAsync()`)
4. **Don't test multiple things in one test**
5. **Don't forget to await async operations**

---

## Coverage

### View Coverage Report

After running `pnpm test:coverage`:

```bash
# Open in browser
open test-report/coverage/index.html
```

### Coverage Thresholds

Current thresholds (in `vitest.config.js`):
- Statements: 50%
- Branches: 50%
- Functions: 50%
- Lines: 50%

### Excluded from Coverage

- Boot files (`src/boot/**`)
- Router (`src/router/**`)
- Admin pages (`src/pages/Admin/**`)
- Admin components (`src/components/admin/**`)

---

## Debugging Tests

### VS Code Setup

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Vitest",
      "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
      "args": ["run"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Console Logging

```javascript
it('logs for debugging', () => {
  console.log('Debug info:', someValue)
  expect(something).toBe(true)
})
```

### Running Specific Tests

```bash
# Run tests matching pattern
pnpm test -- -t "user store"

# Run specific file
pnpm test user-store.test.js

# Run tests in watch mode with pattern
pnpm test -- -t "sign in" --watch
```

---

## Common Issues

### "Cannot find module"

**Solution:** Check import paths. Use aliases:
```javascript
import { useUserStore } from 'src-stores/user-store'
import Example from 'src-components/Example.vue'
```

### "window is not defined"

**Solution:** Ensure `environment: 'jsdom'` is set in `vitest.config.js`

### Tests not re-running in watch mode

**Solution:** Check file is saved and matches `include` pattern in config

### Mock not working

**Solution:** 
1. Ensure `vi.mock()` is at top of file
2. Check mock path matches import path
3. Use `vi.resetAllMocks()` in `beforeEach`

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: pnpm install
      - run: pnpm test:run
      - run: pnpm test:coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: test-report/coverage
```

---

## Test Examples

See existing tests for reference:
- `src/composables/useAdminClaims.test.js` - Composable tests
- `src/stores/user-store.test.js` - Store tests
- `src/components/PineSkeletonLoader.test.js` - Component tests (simple)
- `src/components/ErrorBoundary.test.js` - Component tests (complex)

---

## Next Steps

### Phase 2 Testing Goals:

1. ✅ **Setup Complete** - Vitest, Vue Test Utils, Testing Library installed
2. ✅ **Basic Tests Written** - Composables, stores, critical components
3. 📋 **Expand Coverage** - Add tests for more components
4. 📋 **Integration Tests** - Test user flows
5. 📋 **E2E Tests** - Cypress/Playwright for critical paths

### Recommended Test Priority:

1. **Critical Components** (Done: ErrorBoundary, PineSkeletonLoader)
2. **Shared Components** (Next: AppHeader, SharedNavbar)
3. **Page Components** (IndexPage, ApanamPage)
4. **Admin Components** (lower priority)
5. **Integration Tests** (user authentication flow)
6. **E2E Tests** (critical user journeys)

---

## Support

For testing questions or issues:
1. Check Vitest docs: https://vitest.dev/
2. Check Vue Test Utils: https://test-utils.vuejs.org/
3. Check Testing Library: https://testing-library.com/docs/vue-testing-library/intro/
