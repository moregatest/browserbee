# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BrowserBee is a privacy-first Chrome extension that enables browser automation through natural language. It combines LLM instruction parsing with Playwright for robust browser control, allowing users to interact with websites using conversational commands.

## Architecture

BrowserBee follows a modular agent architecture with four core modules:

- **Agent Module**: Core agent logic with tools for browser automation
- **Background Module**: Extension background processes and Chrome API integration  
- **UI Module**: React-based sidepanel and options interfaces
- **Models Module**: Abstracted LLM provider interface supporting multiple providers

The agent uses a tool-based approach where user instructions are converted into sequences of browser automation tools (click, type, navigate, screenshot, etc.).

## Development Commands

### Build and Development
```bash
# Install dependencies
npm install

# Development mode with hot reloading
npm run dev

# Production build
npm run build

# Copy static files only
npm run copy-static
```

### Code Quality
```bash
# Run ESLint
npm run lint

# Fix auto-fixable ESLint issues
npm run lint:fix

# TypeScript compilation check
npx tsc --noEmit
```

### Testing
```bash
# Run all tests (548 tests across 18 suites)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test files
npm test -- PageContextManager.test.ts
npm test -- --testPathPattern="agent/tools"
```

## Extension Development Workflow

1. Run `npm run dev` to start development mode
2. Load the `dist` folder in Chrome extensions (chrome://extensions/)
3. Make changes to files in `src/`
4. Files rebuild automatically via Vite watch mode
5. Click refresh icon on extension card in Chrome to reload

Note: Unlike web apps, browser extensions require manual reloading after code changes.

## Key Technologies

- **TypeScript**: Strict typing throughout codebase
- **React**: UI components with functional patterns and hooks
- **Vite**: Build tool with ES modules and hot reloading
- **Playwright-CRX**: Browser automation within extension context
- **Jest**: Testing framework with jsdom environment
- **Tailwind CSS + DaisyUI**: Styling system
- **Chrome Extension APIs**: Background scripts, messaging, storage

## Code Structure

### Agent System (`src/agent/`)
- `AgentCore.ts`: Main agent coordinator class
- `ExecutionEngine.ts`: Handles streaming/non-streaming execution
- `ToolManager.ts`: Tool orchestration and health checks
- `PromptManager.ts`: System prompt generation with context
- `MemoryManager.ts`: Stores and retrieves automation patterns
- `tools/`: Modular browser automation tools organized by function

### Models System (`src/models/`)
- `providers/factory.ts`: Creates providers based on configuration
- `providers/types.ts`: Common interfaces for all LLM providers
- Provider implementations for Anthropic, OpenAI, Gemini, Ollama, and OpenAI-compatible

### Background System (`src/background/`)
- `index.ts`: Extension background script entry point
- `agentController.ts`: Agent lifecycle management
- `tabManager.ts`: Chrome tab attachment and control
- `streamingManager.ts`: Real-time response streaming
- `configManager.ts`: Provider configuration management

### UI System (`src/sidepanel/`, `src/options/`)
- `SidePanel.tsx`: Main user interface component
- `Options.tsx`: Configuration interface
- `hooks/`: Custom React hooks for Chrome messaging and state
- `components/`: Reusable UI components with clear separation of concerns

## Testing Philosophy

The project maintains 548 comprehensive tests across:
- Agent core components (275+ tests)
- Browser automation tools (260+ tests)  
- Infrastructure components (13+ tests)

Tests use mocked Playwright interfaces and Chrome APIs to ensure reliability without browser dependencies.

## Extension-Specific Patterns

### Chrome Messaging
Uses Chrome runtime messaging for communication between background, sidepanel, and content contexts with typed message interfaces.

### Tab Management
Implements tab attachment system using Chrome DevTools Protocol for robust page control and lifecycle management.

### Storage
Uses Chrome storage APIs for configuration, memory persistence, and token tracking with local and sync storage separation.

### Provider Configuration
Centralized configuration management supporting multiple LLM providers with validation and secure API key storage.

## Build System Details

- **Vite Config**: Optimized for Chrome extension with multiple entry points
- **Rollup Options**: Generates separate bundles for background, sidepanel, and options
- **Static Files**: Copies manifest.json and HTML files from public/ to dist/
- **Source Maps**: Enabled for development debugging
- **No Minification**: Preserved for playwright-crx compatibility

## Privacy and Security

- All processing happens locally in browser except LLM calls
- API keys stored securely in Chrome sync storage
- No backend infrastructure required
- Memory and automation patterns stored locally via IndexedDB

## Memory System

BrowserBee implements a "reflect and learn" pattern where successful automation sequences are stored as memories for future reuse, reducing token usage and improving efficiency on repeated tasks.