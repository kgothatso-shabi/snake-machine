import type { InterpreterFrom, StateFrom } from 'xstate'

import { MAX_SPEED, MIN_SPEED } from 'src/constants'
import { MAZES } from 'src/mazes'
import { getCurrentSpeed } from 'src/game/game.scoring'
import type { createGameMachine } from 'src/game/game.machine'
import type { GameContext } from 'src/types'

type GameMachine = ReturnType<typeof createGameMachine>
export type GameService = InterpreterFrom<GameMachine>
export type GameState = StateFrom<GameMachine>

const requireElement = <T extends HTMLElement>(selector: string): T => {
  const element = document.querySelector<T>(selector)
  if (!element) throw new Error(`Missing element: ${selector}`)
  return element
}

/** Text shown under the game screen for the current state. */
export const getStatusText = (state: GameState): string => {
  if (state.matches('playing.paused')) return 'Paused'
  if (state.matches('gameOver'))
    return `Game over - ${state.context.score} points`
  const { speed, speedBoost } = state.context
  // Once the score has earned a speed-up, show the speed the snake runs at.
  if (speedBoost > 0) return `Speed ${getCurrentSpeed(speed, speedBoost)}`
  return ''
}

/**
 * Wires the settings panel (speed, maze, pause, new game) to the game and
 * keeps it in sync with the game's state. `onSettingsChange` is called whenever
 * the speed or maze changes.
 */
export const bindSettingsPanel = (
  service: GameService,
  onSettingsChange: (settings: Pick<GameContext, 'speed' | 'maze'>) => void
): void => {
  const speedValue = requireElement<HTMLOutputElement>('#speed-value')
  const mazeValue = requireElement<HTMLOutputElement>('#maze-value')
  const status = requireElement<HTMLElement>('#status')
  const pauseButton = requireElement<HTMLButtonElement>('#pause-button')
  const speedDown = requireElement<HTMLButtonElement>(
    '[data-action="speed-down"]'
  )
  const speedUp = requireElement<HTMLButtonElement>('[data-action="speed-up"]')

  const actions: Record<string, () => void> = {
    'speed-down': () =>
      service.send({
        type: 'SET_SPEED',
        speed: service.getSnapshot().context.speed - 1,
      }),
    'speed-up': () =>
      service.send({
        type: 'SET_SPEED',
        speed: service.getSnapshot().context.speed + 1,
      }),
    'maze-prev': () =>
      service.send({
        type: 'SET_MAZE',
        maze:
          (service.getSnapshot().context.maze + MAZES.length - 1) %
          MAZES.length,
      }),
    'maze-next': () =>
      service.send({
        type: 'SET_MAZE',
        maze: (service.getSnapshot().context.maze + 1) % MAZES.length,
      }),
    pause: () => service.send({ type: 'TOGGLE_PAUSE' }),
    restart: () => service.send({ type: 'RESTART' }),
  }

  document
    .querySelectorAll<HTMLButtonElement>('[data-action]')
    .forEach((button) => {
      button.addEventListener('click', (event) => {
        actions[button.dataset.action!]?.()
        // After a mouse/touch click, give focus back so Space/arrow keys keep
        // controlling the game instead of re-pressing this button.
        if (event.detail > 0) button.blur()
      })
    })

  let lastSettings = ''
  service.onTransition((state) => {
    const { speed, maze } = state.context
    speedValue.value = String(speed)
    mazeValue.value = `${maze} - ${MAZES[maze].name}`
    speedDown.disabled = speed <= MIN_SPEED
    speedUp.disabled = speed >= MAX_SPEED
    status.textContent = getStatusText(state)
    pauseButton.textContent = state.matches('playing.paused')
      ? 'Resume'
      : 'Pause'

    const settings = JSON.stringify({ speed, maze })
    if (settings !== lastSettings) {
      lastSettings = settings
      onSettingsChange({ speed, maze })
    }
  })
}
