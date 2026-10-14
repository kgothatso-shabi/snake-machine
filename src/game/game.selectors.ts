import { GRID_COLUMNS, GRID_ROWS } from 'src/constants'
import * as drawingMaps from 'src/drawingMaps'
import { isWall } from 'src/mazes'
import type {
  BonusContext,
  Direction,
  FoodContext,
  GameContext,
  Point,
  SnakePosition,
} from 'src/types'

/** A function returning a number in [0, 1), like `Math.random`. */
export type RandomFn = () => number

const MAX_X = GRID_COLUMNS - 1
const MAX_Y = GRID_ROWS - 1

/** The cell next to `point` in `direction`. The field wraps around its edges. */
export const step = (point: Point, direction: Direction): Point => {
  switch (direction) {
    case 'up':
      return { x: point.x, y: point.y === 0 ? MAX_Y : point.y - 1 }
    case 'down':
      return { x: point.x, y: point.y === MAX_Y ? 0 : point.y + 1 }
    case 'left':
      return { x: point.x === 0 ? MAX_X : point.x - 1, y: point.y }
    case 'right':
      return { x: point.x === MAX_X ? 0 : point.x + 1, y: point.y }
  }
}

export const getSnakeHead = (context: GameContext): SnakePosition =>
  context.snake!.getSnapshot()!.context.body[0]

/** Where the snake's head goes on the next tick. */
export const getNextSnakePosition = (context: GameContext): SnakePosition => {
  const head = getSnakeHead(context)
  const direction = context.keystrokes[0] || head.direction
  return { ...step(head, direction), direction }
}

/** The cells occupied by a bonus, which is two cells wide. */
export const getBonusCells = (bonus: BonusContext): [Point, Point] => [
  { x: bonus.x, y: bonus.y },
  { x: bonus.x + 1, y: bonus.y },
]

export const getFoodContext = (context: GameContext): FoodContext | undefined =>
  context.food?.getSnapshot()?.context

export const getBonusContext = (
  context: GameContext
): BonusContext | undefined => context.bonus?.getSnapshot()?.context

const samePoint = (a: Point, b: Point) => a.x === b.x && a.y === b.y

/**
 * Snake cells that block new items. The tail is left out because it moves out
 * of the way on the next tick.
 */
const getSnakeObstacles = (context: GameContext): Point[] =>
  context.snake!.getSnapshot()!.context.body.slice(0, -1)

const pickRandom = <T>(items: readonly T[], random: RandomFn): T | undefined =>
  items[Math.floor(random() * items.length)]

/** All cells where a one-cell item fits, given the cells already taken. */
const getFreeCells = (context: GameContext, taken: Point[]): Point[] => {
  const snake = getSnakeObstacles(context)
  const cells: Point[] = []
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLUMNS; x++) {
      const cell = { x, y }
      const blocked =
        isWall(context.maze, cell) ||
        snake.some((part) => samePoint(part, cell)) ||
        taken.some((other) => samePoint(other, cell))
      if (!blocked) cells.push(cell)
    }
  }
  return cells
}

/** Picks a free cell for the next piece of food. */
export const getInitialContextForFood = (
  context: GameContext,
  random: RandomFn = Math.random
): FoodContext => {
  const bonus = getBonusContext(context)
  const taken = bonus ? getBonusCells(bonus) : []
  return pickRandom(getFreeCells(context, taken), random) ?? { x: 0, y: 0 }
}

/** Picks two free, side-by-side cells for the next bonus and a random sprite. */
export const getInitialContextForBonus = (
  context: GameContext,
  random: RandomFn = Math.random
): BonusContext => {
  const food = getFoodContext(context)
  const free = getFreeCells(context, food ? [food] : [])
  const isFree = (cell: Point) => free.some((other) => samePoint(other, cell))
  const spots = free.filter(
    (cell) => cell.x < MAX_X && isFree({ x: cell.x + 1, y: cell.y })
  )
  const { x, y } = pickRandom(spots, random) ?? { x: 0, y: 0 }

  return {
    x,
    y,
    spriteIndex: Math.floor(random() * drawingMaps.bonus.length),
  }
}
