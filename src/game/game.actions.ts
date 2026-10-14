import { assign, send, spawn } from 'xstate'

import { BONUS_LIFETIME_TICKS, FOODS_UNTIL_BONUS } from 'src/constants'
import { clampMaze } from 'src/mazes'
import { clampSpeed } from 'src/settings'
import { renderFrame } from 'src/renderer'
import snakeMachine from 'src/snake/snake.machine'
import foodMachine from 'src/food/food.machine'
import bonusMachine from 'src/bonus/bonus.machine'
import type {
  BonusActor,
  FoodActor,
  GameContext,
  GameEvent,
  RenderState,
  SnakeActor,
} from 'src/types'

import {
  getBonusContext,
  getFoodContext,
  getInitialContextForBonus,
  getInitialContextForFood,
  getNextSnakePosition,
} from './game.selectors'
import {
  getBonusScore,
  getCurrentSpeed,
  getFoodScore,
  getSpeedBoost,
} from './game.scoring'

const assignGame = (
  assignment: Partial<{
    [K in keyof GameContext]: (
      context: GameContext,
      event: GameEvent
    ) => GameContext[K]
  }>
) => assign<GameContext, GameEvent>(assignment)

/* ---------------------------------- actors --------------------------------- */

export const spawnSnake = assignGame({
  snake: () => spawn(snakeMachine) as SnakeActor,
})

export const spawnFood = assignGame({
  food: (context) =>
    spawn(
      foodMachine.withContext(getInitialContextForFood(context))
    ) as unknown as FoodActor,
})

export const spawnBonus = assignGame({
  bonus: (context) =>
    spawn(
      bonusMachine.withContext(getInitialContextForBonus(context))
    ) as unknown as BonusActor,
})

/* -------------------------------- game state -------------------------------- */

export const resetGameData = assignGame({
  keystrokes: () => [],
  speedBoost: () => 0,
  countdownToBonus: () => FOODS_UNTIL_BONUS,
  countdownToRemoveBonus: () => BONUS_LIFETIME_TICKS,
  bonus: () => null,
  score: () => 0,
})

export const resetBonus = assignGame({
  bonus: () => null,
  countdownToBonus: () => FOODS_UNTIL_BONUS,
  countdownToRemoveBonus: () => BONUS_LIFETIME_TICKS,
})

export const registerKeystroke = assignGame({
  keystrokes: (context, event) =>
    event.type === 'KEY_PRESS'
      ? [...context.keystrokes, event.key]
      : context.keystrokes,
})

export const removeKeystroke = assignGame({
  keystrokes: (context) => context.keystrokes.slice(1),
})

export const decreaseCountdownToBonus = assignGame({
  countdownToBonus: (context) =>
    context.bonus ? context.countdownToBonus : context.countdownToBonus - 1,
})

export const decreaseCountdownToRemoveBonus = assignGame({
  countdownToRemoveBonus: (context) => context.countdownToRemoveBonus - 1,
})

export const updateScoreWithFood = assignGame({
  score: (context) =>
    context.score +
    getFoodScore(getCurrentSpeed(context.speed, context.speedBoost)),
})

export const updateScoreWithBonus = assignGame({
  score: (context) =>
    context.score +
    getBonusScore(
      getCurrentSpeed(context.speed, context.speedBoost),
      context.countdownToRemoveBonus
    ),
})

/** Speeds the snake up one level each time the score reaches another multiple of 300. */
export const updateSpeedBoost = assignGame({
  speedBoost: (context) => getSpeedBoost(context.score),
})

/* --------------------------------- settings --------------------------------- */

export const setSpeed = assignGame({
  speed: (context, event) =>
    event.type === 'SET_SPEED' ? clampSpeed(event.speed) : context.speed,
})

export const setMaze = assignGame({
  maze: (context, event) =>
    event.type === 'SET_MAZE' ? clampMaze(event.maze) : context.maze,
})

/* ------------------------------ messages to snake ----------------------------- */

const toSnake = { to: (context: GameContext) => context.snake! }

export const tellSnakeToEatFood = send<GameContext, GameEvent>(
  { type: 'EAT_FOOD' },
  toSnake
)

export const tellSnakeToEatBonus = send<GameContext, GameEvent>(
  { type: 'EAT_BONUS' },
  toSnake
)

export const tellSnakeToCrash = send<GameContext, GameEvent>(
  { type: 'CRASH' },
  toSnake
)

export const updateSnakePosition = send<GameContext, GameEvent>(
  (context) => ({
    type: 'UPDATE_POSITION',
    position: getNextSnakePosition(context),
  }),
  toSnake
)

/* -------------------------------- rendering --------------------------------- */

const getRenderState = (
  context: GameContext,
  withSnake: boolean
): RenderState => ({
  snake: withSnake ? context.snake!.getSnapshot()!.context : null,
  food: getFoodContext(context)!,
  bonus: getBonusContext(context),
  maze: context.maze,
  score: context.score,
  countdownToRemoveBonus: context.countdownToRemoveBonus,
})

export const drawGame = (context: GameContext): void =>
  renderFrame(getRenderState(context, true))

export const drawGameWithoutSnake = (context: GameContext): void =>
  renderFrame(getRenderState(context, false))
