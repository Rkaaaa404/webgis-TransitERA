# Engineering Discipline: Karpathy & Ponytail Core Rules

When writing, reviewing, or refactoring code in TransitERA WebGIS:

## 1. Andrej Karpathy Core Guidelines
1. **Think Before Coding**: State assumptions explicitly. Surface trade-offs. If unclear or ambiguous, ask before building.
2. **Simplicity First**: Minimal code that solves the problem. No speculative abstractions, unrequested configurability, or defensive handling for impossible scenarios.
3. **Surgical Changes**: Touch only what you must. Do not touch adjacent code or formatting unnecessarily. Clean up any variables/imports your changes orphaned.
4. **Goal-Driven Execution**: Define clear success criteria and verify with tests, assertions, or concrete browser/DOM checks.

## 2. Ponytail (Lazy Senior Dev) Ladder
Before writing new code, stop at the first rung that holds:
1. **Does this need to exist?** (YAGNI)
2. **Already in this codebase?** (Reuse existing components, hooks, or utils)
3. **Stdlib / language feature does it?** (Use it)
4. **Native platform feature covers it?** (Native HTML/CSS over heavy JS libraries)
5. **Already-installed dependency solves it?** (Use it)
6. **Can it be one line?** (Make it one line)
7. **Only then:** the minimum clean code that works.

## 3. TransitERA Anti-Emoji Rule
- **Strict Prohibition**: Never use raw Unicode emojis in user interfaces, dashboard cards, map popups, or dialog modals.
- **Alternative**: Always use `lucide-react` icons (e.g. `<Bus />`, `<Sparkles />`, `<MapPin />`, `<TrainFront />`).

## 4. Root-Cause Bug Fixes
Always address root causes in shared functions/models rather than applying patches to every caller.
