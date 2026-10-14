import { describe, expect, it } from 'vitest'
import { GRID_COLUMNS, GRID_ROWS } from 'src/constants'
import { MAZES, isWall } from 'src/mazes'
import type { GameContext, SnakePosition } from 'src/types'
import {
  getBonusScore,
  getCurrentSpeed,
  getFoodScore,
  getSpeedBoost,
} from './game.scoring'
import {
  getInitialContextForBonus,
  getInitialContextForFood,
  step,
} from './game.selectors'

/** A GameContext with a fake snake, enough for the selectors. */
const createContext = (
  maze: number,
  body: SnakePosition[] = [{ x: 3, y: 5, direction: 'right' }]
): GameContext =>
  ({
    snake: { getSnapshot: () => ({ context: { body } }) },
    food: null,
    bonus: null,
    keystrokes: [],
    speedBoost: 0,
    countdownToBonus: 4,
    countdownToRemoveBonus: 20,
    speed: 8,
    maze,
    score: 0,
  } as unknown as GameContext)

/** Deterministic "random" numbers cycling through 0..1. */
const sequence = (count: number) => {
  let i = 0
  return () => (i++ % count) / count
}

describe('step', () => {
  it('moves one cell', () => {
    expect(step({ x: 5, y: 5 }, 'up')).toEqual({ x: 5, y: 4 })
    expect(step({ x: 5, y: 5 }, 'down')).toEqual({ x: 5, y: 6 })
    expect(step({ x: 5, y: 5 }, 'left')).toEqual({ x: 4, y: 5 })
    expect(step({ x: 5, y: 5 }, 'right')).toEqual({ x: 6, y: 5 })
  })

  it('wraps around the edges', () => {
    expect(step({ x: 0, y: 0 }, 'up')).toEqual({ x: 0, y: GRID_ROWS - 1 })
    expect(step({ x: 0, y: GRID_ROWS - 1 }, 'down')).toEqual({ x: 0, y: 0 })
    expect(step({ x: 0, y: 0 }, 'left')).toEqual({ x: GRID_COLUMNS - 1, y: 0 })
    expect(step({ x: GRID_COLUMNS - 1, y: 0 }, 'right')).toEqual({ x: 0, y: 0 })
  })
})

describe('item spawning', () => {
  it.each(MAZES.map((maze, index) => [index, maze.name] as const))(
    'never puts food or a bonus on a wall or the snake (maze %i: %s)',
    (mazeIndex) => {
      const body: SnakePosition[] = Array.from({ length: 8 }, (_, i) => ({
        x: 7 - i,
        y: 5,
        direction: 'right' as const,
      }))
      const context = createContext(mazeIndex, body)
      const random = sequence(97)

      for (let i = 0; i < 300; i++) {
        const food = getInitialContextForFood(context, random)
        expect(isWall(mazeIndex, food)).toBe(false)
        expect(
          body.slice(0, -1).some((p) => p.x === food.x && p.y === food.y)
        ).toBe(false)

        const bonus = getInitialContextForBonus(context, random)
        expect(isWall(mazeIndex, bonus)).toBe(false)
        expect(isWall(mazeIndex, { x: bonus.x + 1, y: bonus.y })).toBe(false)
        expect(bonus.x + 1).toBeLessThan(GRID_COLUMNS)
      }
    }
  )
})

describe('scoring', () => {
  it('gives the speed level for food', () => {
    expect(getFoodScore(8)).toBe(8)
  })

  it('gives fewer bonus points the longer the bonus stays', () => {
    expect(getBonusScore(8, 20)).toBe(85)
    expect(getBonusScore(8, 10)).toBe(65)
  })
})

describe('speed-ups', () => {
  it('earns one speed level for every 300 points', () => {
    expect(getSpeedBoost(0)).toBe(0)
    expect(getSpeedBoost(299)).toBe(0)
    expect(getSpeedBoost(300)).toBe(1)
    expect(getSpeedBoost(599)).toBe(1)
    expect(getSpeedBoost(600)).toBe(2)
  })

  it('adds the boost to the chosen speed, up to the maximum', () => {
    expect(getCurrentSpeed(8, 0)).toBe(8)
    expect(getCurrentSpeed(8, 1)).toBe(9)
    expect(getCurrentSpeed(24, 3)).toBe(25)
    expect(getCurrentSpeed(25, 1)).toBe(25)
  })
})
