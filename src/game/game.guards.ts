import { MAX_KEYSTROKE_BUFFER } from 'src/constants'
import { clampMaze, isWall } from 'src/mazes'
import type { Direction, GameContext, GameEvent } from 'src/types'
import { clampSpeed } from 'src/settings'
import {
  getBonusCells,
  getBonusContext,
  getFoodContext,
  getNextSnakePosition,
  getSnakeHead,
} from './game.selectors'

/** For each current direction, the directions the snake may turn to. */
const TURNS: Record<Direction, readonly Direction[]> = {
  up: ['left', 'right'],
  down: ['left', 'right'],
  left: ['up', 'down'],
  right: ['up', 'down'],
}

/**
 * A key press is accepted if it is a 90 degree turn relative to the last
 * queued direction (or the head's direction if none is queued), and the queue
 * is not full.
 */
export const isValidKey = (context: GameContext, event: GameEvent): boolean => {
  if (event.type !== 'KEY_PRESS') return false
  if (context.keystrokes.length >= MAX_KEYSTROKE_BUFFER) return false

  const lastKeystroke = context.keystrokes[context.keystrokes.length - 1]
  const currentDirection = lastKeystroke || getSnakeHead(context).direction
  return TURNS[currentDirection].includes(event.key)
}

export const willEatFood = (context: GameContext): boolean => {
  const head = getNextSnakePosition(context)
  const food = getFoodContext(context)
  return Boolean(food && head.x === food.x && head.y === food.y)
}

export const willEatBonus = (context: GameContext): boolean => {
  const head = getNextSnakePosition(context)
  const bonus = getBonusContext(context)
  return Boolean(
    bonus &&
      getBonusCells(bonus).some(
        (cell) => cell.x === head.x && cell.y === head.y
      )
  )
}

export const willHitSelf = (context: GameContext): boolean => {
  const { x, y } = getNextSnakePosition(context)
  // The tail is ignored because it moves away on the same tick.
  const body = context.snake!.getSnapshot()!.context.body
  return body.slice(0, -1).some((item) => x === item.x && y === item.y)
}

export const willHitWall = (context: GameContext): boolean =>
  isWall(context.maze, getNextSnakePosition(context))

/** The snake would run into its own body or a wall. */
export const willCrash = (context: GameContext): boolean =>
  willHitSelf(context) || willHitWall(context)

/**
 * A crash is forgiven once: the first time the snake stops in front of the
 * obstacle (`crashing`). It dies if it is still blocked on the next tick, or if
 * the player queued a turn straight into the obstacle.
 */
export const willDie = (context: GameContext): boolean =>
  willCrash(context) &&
  (context.keystrokes.length > 0 ||
    context.snake!.getSnapshot()!.matches('crashing'))

export const isTimeForBonus = (context: GameContext): boolean =>
  context.countdownToBonus === 0 && !context.bonus

export const countdownToRemoveBonusHasEnded = (context: GameContext): boolean =>
  context.countdownToRemoveBonus === 0

export const bonusNotExists = (context: GameContext): boolean =>
  context.bonus === null

export const bonusExists = (context: GameContext): boolean =>
  Boolean(context.bonus)

/** SET_SPEED only restarts the game when the speed really changes. */
export const speedWillChange = (
  context: GameContext,
  event: GameEvent
): boolean =>
  event.type === 'SET_SPEED' && clampSpeed(event.speed) !== context.speed

/** SET_MAZE only restarts the game when the maze really changes. */
export const mazeWillChange = (
  context: GameContext,
  event: GameEvent
): boolean =>
  event.type === 'SET_MAZE' && clampMaze(event.maze) !== context.maze
