import { createMachine } from 'xstate'

import {
  BASE_TICK_MS,
  BLINK_DELAY_MS,
  BONUS_LIFETIME_TICKS,
  FOODS_UNTIL_BONUS,
  GAME_OVER_DELAY_MS,
} from 'src/constants'
import { DEFAULT_SETTINGS } from 'src/settings'
import type { GameContext, GameEvent, GameSettings } from 'src/types'
import * as gameGuards from './game.guards'
import * as gameActions from './game.actions'
import { getCurrentSpeed } from './game.scoring'

export const initialGameContext: GameContext = {
  snake: null,
  food: null,
  bonus: null,
  keystrokes: [],
  speedBoost: 0,
  countdownToBonus: FOODS_UNTIL_BONUS,
  countdownToRemoveBonus: BONUS_LIFETIME_TICKS,
  ...DEFAULT_SETTINGS,
  score: 0,
}

/**
 * Builds the game machine, starting with the given settings.
 *
 * The game itself. See docs/DOCUMENTATION.md for a diagram.
 *
 * - `idle`: waiting for PLAY.
 * - `playing.running`: one tick = `ticking` (decide and move) then
 *   `waitingTick` (sleep for the tick delay). Every 300 points the tick delay
 *   shortens: the snake gains a speed level (`speedBoost`).
 * - `playing.paused`: ticking stops; resumed by TOGGLE_PAUSE.
 * - `gameOver`: blinks the snake for a few seconds, then starts a new game.
 *
 * RESTART, SET_SPEED and SET_MAZE start a new game from any state.
 */
export const createGameMachine = (settings: GameSettings = DEFAULT_SETTINGS) =>
  createMachine<GameContext, GameEvent>(
    {
      id: 'game',
      initial: 'idle',
      context: { ...initialGameContext, ...settings },
      on: {
        RESTART: 'playing',
        SET_SPEED: {
          target: 'playing',
          cond: 'speedWillChange',
          actions: 'setSpeed',
        },
        SET_MAZE: {
          target: 'playing',
          cond: 'mazeWillChange',
          actions: 'setMaze',
        },
      },
      states: {
        idle: {
          on: {
            PLAY: 'playing',
          },
        },
        playing: {
          entry: ['resetGameData', 'spawnSnake', 'spawnFood'],
          initial: 'running',
          states: {
            running: {
              initial: 'ticking',
              on: {
                KEY_PRESS: { actions: 'registerKeystroke', cond: 'isValidKey' },
                TOGGLE_PAUSE: 'paused',
              },
              states: {
                waitingTick: {
                  after: {
                    TICK_DELAY: 'ticking',
                  },
                },
                ticking: {
                  onDone: {
                    target: 'waitingTick',
                    actions: ['removeKeystroke', 'drawGame'],
                  },
                  initial: 'checkingThatWillDie',
                  states: {
                    checkingThatWillDie: {
                      always: [
                        { cond: 'willDie', target: '#game.gameOver' },
                        { cond: 'willCrash', target: 'crashing' },
                        { target: 'checkingBonus' },
                      ],
                    },
                    checkingBonus: {
                      always: [
                        {
                          cond: 'willEatBonus',
                          target: 'updatingSnakePosition',
                          actions: [
                            'tellSnakeToEatBonus',
                            'updateScoreWithBonus',
                            'updateSpeedBoost',
                            'resetBonus',
                          ],
                        },
                        {
                          cond: 'countdownToRemoveBonusHasEnded',
                          target: 'checkingFood',
                          actions: 'resetBonus',
                        },
                        {
                          cond: 'bonusExists',
                          target: 'checkingFood',
                          actions: 'decreaseCountdownToRemoveBonus',
                        },
                        { target: 'checkingFood' },
                      ],
                    },
                    checkingFood: {
                      always: [
                        {
                          cond: 'willEatFood',
                          target: 'afterEatFood',
                          actions: [
                            'tellSnakeToEatFood',
                            'updateScoreWithFood',
                            'updateSpeedBoost',
                            'spawnFood',
                          ],
                        },
                        { target: 'updatingSnakePosition' },
                      ],
                    },
                    afterEatFood: {
                      always: [
                        {
                          cond: 'isTimeForBonus',
                          actions: 'spawnBonus',
                          target: 'updatingSnakePosition',
                        },
                        {
                          cond: 'bonusNotExists',
                          actions: 'decreaseCountdownToBonus',
                          target: 'updatingSnakePosition',
                        },
                        { target: 'updatingSnakePosition' },
                      ],
                    },
                    updatingSnakePosition: {
                      entry: 'updateSnakePosition',
                      type: 'final',
                    },
                    crashing: {
                      entry: 'tellSnakeToCrash',
                      type: 'final',
                    },
                  },
                },
              },
            },
            paused: {
              on: {
                // Resume with a full tick delay so the player can get ready.
                TOGGLE_PAUSE: 'running.waitingTick',
              },
            },
          },
        },
        gameOver: {
          initial: 'renderWithSnake',
          after: {
            GAME_OVER_DELAY: 'playing',
          },
          states: {
            renderWithSnake: {
              entry: 'drawGame',
              after: {
                BLINK_DELAY: 'renderWithoutSnake',
              },
            },
            renderWithoutSnake: {
              entry: 'drawGameWithoutSnake',
              after: {
                BLINK_DELAY: 'renderWithSnake',
              },
            },
          },
        },
      },
    },
    {
      guards: gameGuards,
      actions: gameActions,
      delays: {
        TICK_DELAY: (context) =>
          BASE_TICK_MS / getCurrentSpeed(context.speed, context.speedBoost),
        GAME_OVER_DELAY: GAME_OVER_DELAY_MS,
        BLINK_DELAY: BLINK_DELAY_MS,
      },
    }
  )

const gameMachine = createGameMachine()

export default gameMachine
