# NPM & Node Development Cheat Sheet

## Process Management

### Check What's Using a Port

```bash
lsof -i :5173           # Check port 5173
lsof -i :5174           # Check port 5174
```

-   **No output + exit code 1** = port is free
-   **Output with PID** = something is using it

### Kill Processes

```bash
kill <PID>              # Kill specific process by ID
pkill -f "vite"         # Kill all Vite processes
ps aux | grep node      # List all node processes
```

---

## Dev Server Commands

### Starting Dev Server

```bash
npm run dev                    # If "dev" script exists in package.json
npm run dev --prefix ui-src    # Run in subdirectory without cd-ing
cd ui-src && npm run dev       # Alternative (changes your cwd)
```

### Script Chaining

```
Root: npm run dev
  └── --prefix ui-src → runs ui-src's "dev" script
        └── ui-src/package.json: "dev": "vite"
              └── Starts Vite dev server
```

---

## npm Scripts vs CLI Commands

| Context                  | `vite` resolves to            |
| ------------------------ | ----------------------------- |
| Terminal directly        | ❌ Not found (not in PATH)    |
| `npm run dev`            | ✅ `./node_modules/.bin/vite` |
| `npx vite`               | ✅ `./node_modules/.bin/vite` |
| `./vite` (from .bin dir) | ✅ Explicit path              |

**Why?** When running `npm run <script>`, npm temporarily adds `node_modules/.bin/` to PATH.

---

## Cache Issues

### Clear Vite Cache

```bash
rm -rf ui-src/node_modules/.vite
```

### Clear TypeScript Cache

```bash
rm -rf ui-src/node_modules/.cache
rm -rf ui-src/tsconfig.tsbuildinfo
```

### Hard Refresh Browser

-   **Mac:** `Cmd + Shift + R`
-   **Windows:** `Ctrl + Shift + R`

---

## Common Issues

### Build Stuck on `tsc && vite build`

1. Check if running from iCloud Drive (very slow I/O)
2. Kill zombie node processes: `pkill -f "vite"`
3. Run from local drive, not cloud-synced folders

### Multiple Dev Servers Running

```bash
lsof -i :5173    # Check for first server
lsof -i :5174    # Check for second server
kill <PID>       # Kill the extras
```

### Port Already in Use

Vite auto-increments: 5173 → 5174 → 5175...
Kill the old server or use the new port.

---

## Key Paths

| What           | Path                    |
| -------------- | ----------------------- |
| Local binaries | `./node_modules/.bin/`  |
| Vite cache     | `./node_modules/.vite/` |
| Build output   | `./dist/`               |

---

## `--prefix` vs `cd`

Both are equivalent:

```bash
npm run build --prefix ui-src    # Stays in current directory
cd ui-src && npm run build       # Changes directory
```

`--prefix` is cleaner for scripts because your shell stays in the root.
