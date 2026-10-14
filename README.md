# Snake II (Nokia 3310 remake)

A remake of the classic **Snake II** from the Nokia 3310, in black and cream white. It runs in the browser and as a Windows desktop app.

**Version 1.0.2** · by **The Native Black**

<!-- Add a screenshot or GIF of the game here, for example:
![Gameplay](docs/screenshot.png)
-->

## Credits

This project is based on **[Snake Machine](https://github.com/flplima/snake-machine)** by **[Felipe Lima](https://github.com/flplima)**. Felipe wrote the original game in TypeScript with XState state machines, and the game logic, renderer, tests and structure in this repository all come from his work.

We adapted it to our own taste. Thank you, Felipe, for sharing such a well-built project. If you like this game, please give the [original repository](https://github.com/flplima/snake-machine) a star too.

## What is different from the original

| | Original | This version |
| --- | --- | --- |
| Look | Green LCD | Monochrome: black and cream white |
| Speed levels | 1 to 9 | 1 to 25 |
| Speed-ups | None | The snake gains a speed level every 300 points (up to 25) |
| Mazes | 7 | 8: new **Labyrinth**, sealed by solid walls so the snake cannot wrap around the screen |
| Screen size | Fixed size | Resizes to fit any device, in portrait and landscape |
| Desktop app details | Original author | Company: The Native Black, file version 1.0.2 |

Everything else (food, bonuses, wrap-around edges, controls, state machines) works as in the original.

## Features

- Classic Snake II gameplay: food, timed bonuses, wrap-around edges
- 8 mazes: none, frame, pillars, bars, crosses, corners, zigzag and labyrinth
- Speed levels 1 to 25, remembered between sessions, plus an automatic speed-up every 300 points
- Mobile friendly: on-screen D-pad, swipe gestures, screen that adapts to the device
- Windows desktop app (installer and portable `.exe`)
- Pause / resume, new game, keyboard shortcuts
- Strict TypeScript and a unit test suite

## Getting started

You need [Node.js](https://nodejs.org/) 18 or newer.

```bash
# Clone this repository
git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY
cd YOUR-REPOSITORY

# Install dependencies
npm install

# Start the development server on port 3000
npm run dev
```

Other commands: `npm run build`, `npm run typecheck`, `npm test`.

## Windows desktop app

```bash
npm run desktop    # open the game in a desktop window
npm run dist:win   # build the installer and portable .exe into release/ (run on Windows)
```

The files are named `Snake II-Setup-1.0.2.exe` and `Snake II-Portable-1.0.2.exe`.

## Controls

| Action | Keyboard | Touch |
| --- | --- | --- |
| Steer | Arrow keys / WASD | D-pad or swipe |
| Pause | P / Space | Pause button |
| Speed | `-` / `+` | Speed buttons |
| Maze | M | Maze buttons |
| New game | R | New game button |

## Documentation

See [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md) for the architecture, state machines, maze format, desktop build and testing.

## Built with

- **XState** for state management and game logic
- **Canvas API** to render the game
- **Vite** for the development server and build
- **Electron** for the Windows app
- **Vitest** for tests

## About this release

| | |
| --- | --- |
| **Description** | A remake of the classic Snake II Nokia 3310 game |
| **Company** | The Native Black |
| **File version** | 1.0.2 |

## License

This project is derived from [Snake Machine](https://github.com/flplima/snake-machine) by Felipe Lima. The original code remains his work and is subject to the terms of the original repository. Our changes are copyright © 2026 The Native Black.

*Snake and Nokia are trademarks of their respective owners. This is a fan-made remake and is not affiliated with Nokia.*
