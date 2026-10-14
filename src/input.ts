import type { Direction, GameEvent } from 'src/types'

type Send = (event: GameEvent) => void

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
}

/** Smallest finger movement, in CSS pixels, that counts as a swipe. */
const SWIPE_THRESHOLD = 24

/**
 * Turns a keyboard event into a game event, or returns undefined if the key
 * has no meaning for the game.
 */
export const getEventForKey = (
  key: string,
  options: { speed: number; maze: number; mazeCount: number }
): GameEvent | undefined => {
  const direction = KEY_TO_DIRECTION[key] ?? KEY_TO_DIRECTION[key.toLowerCase()]
  if (direction) return { type: 'KEY_PRESS', key: direction }

  switch (key) {
    case 'p':
    case 'P':
    case ' ':
    case 'Escape':
      return { type: 'TOGGLE_PAUSE' }
    case 'r':
    case 'R':
      return { type: 'RESTART' }
    case '+':
    case '=':
      return { type: 'SET_SPEED', speed: options.speed + 1 }
    case '-':
    case '_':
      return { type: 'SET_SPEED', speed: options.speed - 1 }
    case 'm':
    case 'M':
      return { type: 'SET_MAZE', maze: (options.maze + 1) % options.mazeCount }
    default:
      return undefined
  }
}

/** Keyboard controls. `getOptions` supplies the current speed and maze. */
export const bindKeyboard = (
  send: Send,
  getOptions: () => { speed: number; maze: number; mazeCount: number }
): void => {
  window.addEventListener('keydown', (event) => {
    // Keep browser/OS shortcuts such as Ctrl+R working.
    if (event.ctrlKey || event.metaKey || event.altKey) return

    const gameEvent = getEventForKey(event.key, getOptions())
    if (!gameEvent) return

    event.preventDefault()
    // Holding an arrow is harmless, but holding P or R should not repeat.
    if (event.repeat && gameEvent.type !== 'KEY_PRESS') return
    send(gameEvent)
  })
}

/** On-screen D-pad. Uses pointerdown so there is no tap delay. */
export const bindTouchControls = (root: HTMLElement, send: Send): void => {
  root.addEventListener('contextmenu', (event) => event.preventDefault())
  root
    .querySelectorAll<HTMLButtonElement>('[data-direction]')
    .forEach((button) => {
      button.addEventListener('pointerdown', (event) => {
        event.preventDefault()
        send({ type: 'KEY_PRESS', key: button.dataset.direction as Direction })
      })
    })
}

/** Swipe on the game screen to steer. */
export const bindSwipe = (target: HTMLElement, send: Send): void => {
  let start: { x: number; y: number } | null = null

  target.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse') return
    start = { x: event.clientX, y: event.clientY }
  })

  target.addEventListener('pointerup', (event) => {
    if (!start) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    start = null
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) return
    const direction: Direction =
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0
          ? 'right'
          : 'left'
        : dy > 0
        ? 'down'
        : 'up'
    send({ type: 'KEY_PRESS', key: direction })
  })

  target.addEventListener('pointercancel', () => {
    start = null
  })
}
