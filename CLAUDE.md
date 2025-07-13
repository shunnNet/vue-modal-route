# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

vue-modal-route is a Vue 3 package that integrates vue-router with modal state management. This is a monorepo project using pnpm workspace to manage multiple packages.

## Project Structure

```
packages/
├── core/     # Core package @vmrh/core - Contains all modal routing logic
└── nuxt/     # Nuxt module @vmrh/nuxt - Nuxt framework integration

playground/
├── vite/     # Vite development environment
└── vite-uvr/ # Vite environment with unplugin-vue-router
```

## Common Development Commands

### Core Package Development
```bash
# Build core package
pnpm build:core

# Development mode (generate stub)
pnpm stub:core

# Run Vite playground
pnpm play:vite

# Build Vite playground  
pnpm play:build:vite
```

### Nuxt Module Development
```bash
# Prepare Nuxt development environment
pnpm prepare:nuxt

# Develop Nuxt module
pnpm dev:nuxt

# Build Nuxt module
pnpm build:nuxt
```

### Code Quality
```bash
# ESLint check (run from root)
pnpm lint

# TypeScript type checking
pnpm typecheck
```

## Architecture Overview

### Core Concepts

1. **Modal Types**:
   - **Path Modal**: Bound to specific page routes (e.g., `/user/:id`)
   - **Global Modal**: Can be opened from any page (e.g., login, settings)
   - **Query Modal**: Triggered via query parameters (e.g., `?confirm=true`)

2. **Main Components**:
   - `ModalRouterView`: Renderer for path-based modals
   - `ModalGlobalView`: Renderer for global modals
   - `ModalQueryView`: Renderer for query-based modals
   - `ModalLayout`: Modal layout wrapper

3. **Core APIs**:
   - `createModalRoute()`: Create modal route configuration
   - `useModalRoute()`: Composable for opening/closing modals
   - `setupModal()`: Configure modal in child routes
   - `useCurrentModal()`: Get current modal state

### File Structure

```
packages/core/src/
├── components/      # Vue components
├── core/           # Core logic (ModalRoute, store, path/query/global handling)
├── history/        # Browser history management and time machine
├── utils/          # Utility functions
├── composables.ts  # Vue composables
├── modalRoute.ts   # Main entry point
└── types.ts        # TypeScript type definitions
```

### Important Implementation Details

1. **Route Integration**:
   - Uses Vue Router's `beforeResolve` and `afterEach` hooks to manage modal state
   - Handles browser history through `history/timeMachine.ts`

2. **State Management**:
   - Uses reactive store (`core/store.ts`) to manage all modal states
   - Supports multiple simultaneously open modals (stack)

3. **Data Passing**:
   - Supports passing complex objects as modal props (not limited to URL-encodable types)
   - Supports modal return value mechanism

## Development Notes

1. **Route Naming**: All routes must have names, and must be string type

2. **Direct Access**: Modals don't allow direct URL access by default, need to set `meta.direct: true`

3. **Browser Navigation**: Forward navigation to open modals is not supported

4. **Build Tool**: Core package uses `tsdown` for TypeScript compilation, supports ESM and CJS output

5. **Node Version**: Requires Node.js >= 20.0.0

## Testing Development

The project is currently establishing its testing framework. When developing new features, please refer to examples in the playground for manual testing.