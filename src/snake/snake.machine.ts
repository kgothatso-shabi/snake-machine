import { createMachine } from 'xstate'
import {
  INITIAL_SNAKE_HEAD_X,
  INITIAL_SNAKE_LENGTH,
  INITIAL_SNAKE_Y,
} from 'src/constants'
import type { SnakeContext, SnakeEvent, SnakePosition } from 'src/types'
import * as snakeActions from './snake.actions'

/** A horizontal snake heading right, head first. */
export const createInitialBody = (): SnakePosition[] =>
  Array.from({ length: INITIAL_SNAKE_LENGTH }, (_, i) => ({
    x: INITIAL_SNAKE_HEAD_X - i,
    y: INITIAL_SNAKE_Y,
    direction: 'right' as const,
  }))

/**
 * Owns the snake's body.
 *
 * - `idle`: normal movement; each UPDATE_POSITION adds a head and drops the tail.
 * - `eatingFood`: the next move keeps the tail, so the snake grows by one.
 * - `eatingBonus`: the next move also marks the head with food but drops the tail.
 * - `crashing`: the game found an obstacle ahead and gave the player one tick
 *   to steer away. The snake does not move meanwhile.
 */
const snakeMachine = createMachine<SnakeContext, SnakeEvent>(
  {
    id: 'snake',
    initial: 'idle',
    context: {
      body: createInitialBody(),
    },
    states: {
      idle: {
        on: {
          UPDATE_POSITION: {
            actions: ['appendBody', 'removeLastBody'],
          },
          EAT_FOOD: 'eatingFood',
          EAT_BONUS: 'eatingBonus',
          CRASH: 'crashing',
        },
      },
      eatingFood: {
        on: {
          UPDATE_POSITION: {
            target: 'idle',
            actions: ['appendBody', 'registerFoodEaten'],
          },
        },
      },
      eatingBonus: {
        on: {
          UPDATE_POSITION: {
            target: 'idle',
            actions: ['appendBody', 'registerFoodEaten', 'removeLastBody'],
          },
        },
      },
      crashing: {
        on: {
          UPDATE_POSITION: {
            target: 'idle',
            actions: ['appendBody', 'removeLastBody'],
          },
          EAT_FOOD: 'eatingFood',
          EAT_BONUS: 'eatingBonus',
        },
      },
    },
  },
  {
    actions: snakeActions,
  }
)

export default snakeMachine
