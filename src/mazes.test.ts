import { describe, expect, it } from 'vitest'
import {
  GRID_COLUMNS,
  GRID_ROWS,
  INITIAL_SNAKE_HEAD_X,
  INITIAL_SNAKE_LENGTH,
  INITIAL_SNAKE_Y,
} from 'src/constants'
import { MAZES, NO_MAZE, clampMaze, getMaze, isWall } from 'src/mazes'

/** Free cells reachable from the snake's start, moving in 4 directions with wrap-around. */
const countReachableFreeCells = (maze: number): number => {
  const key = (x: number, y: number) => y * GRID_COLUMNS + x
  // Start from the snake's head: it is a free cell in every maze.
  const start = { x: INITIAL_SNAKE_HEAD_X, y: INITIAL_SNAKE_Y }
  const seen = new Set<number>([key(start.x, start.y)])
  const queue = [start]
  while (queue.length) {
    const { x, y } = queue.pop()!
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const next = {
        x: (x + dx + GRID_COLUMNS) % GRID_COLUMNS,
        y: (y + dy + GRID_ROWS) % GRID_ROWS,
      }
      if (!isWall(maze, next) && !seen.has(key(next.x, next.y))) {
        seen.add(key(next.x, next.y))
        queue.push(next)
      }
    }
  }
  return seen.size
}

describe('mazes', () => {
  it('starts with a maze without walls', () => {
    expect(getMaze(NO_MAZE).walls).toHaveLength(0)
    expect(MAZES.length).toBeGreaterThan(1)
  })

  it.each(MAZES.map((maze, index) => [index, maze.name] as const))(
    'maze %i (%s) has the right size',
    (index) => {
      const { layout } = MAZES[index]
      expect(layout).toHaveLength(GRID_ROWS)
      layout.forEach((row) => expect(row).toHaveLength(GRID_COLUMNS))
    }
  )

  it.each(MAZES.map((maze, index) => [index, maze.name] as const))(
    'maze %i (%s) leaves the snake room to start',
    (index) => {
      // The snake's body and 8 cells ahead of its head must be free.
      const tailX = INITIAL_SNAKE_HEAD_X - INITIAL_SNAKE_LENGTH + 1
      for (let x = tailX; x <= INITIAL_SNAKE_HEAD_X + 8; x++) {
        expect(isWall(index, { x, y: INITIAL_SNAKE_Y })).toBe(false)
      }
    }
  )

  it.each(MAZES.map((maze, index) => [index, maze.name] as const))(
    'maze %i (%s) has no closed pockets',
    (index) => {
      const free = GRID_COLUMNS * GRID_ROWS - MAZES[index].walls.length
      expect(countReachableFreeCells(index)).toBe(free)
    }
  )

  it('has a sealed maze: solid border, so the snake cannot wrap around', () => {
    const labyrinth = MAZES.findIndex((maze) => maze.name === 'Labyrinth')
    expect(labyrinth).toBeGreaterThan(0)
    for (let x = 0; x < GRID_COLUMNS; x++) {
      expect(isWall(labyrinth, { x, y: 0 })).toBe(true)
      expect(isWall(labyrinth, { x, y: GRID_ROWS - 1 })).toBe(true)
    }
    for (let y = 0; y < GRID_ROWS; y++) {
      expect(isWall(labyrinth, { x: 0, y })).toBe(true)
      expect(isWall(labyrinth, { x: GRID_COLUMNS - 1, y })).toBe(true)
    }
  })

  it('falls back to no maze for invalid indexes', () => {
    expect(clampMaze(-1)).toBe(NO_MAZE)
    expect(clampMaze(99)).toBe(NO_MAZE)
    expect(clampMaze(1.5)).toBe(NO_MAZE)
    expect(clampMaze(2)).toBe(2)
  })
})
