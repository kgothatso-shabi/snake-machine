import { GRID_COLUMNS, GRID_ROWS } from 'src/constants'
import type { Point } from 'src/types'

/**
 * Maze layouts.
 *
 * Each maze is a GRID_ROWS x GRID_COLUMNS ASCII picture: `#` is a wall and `.`
 * is free space. The field wraps around its edges, so a maze that should be
 * sealed (like "Labyrinth") has a solid wall border with no gaps. Rules every layout must follow (they are enforced by
 * `mazes.test.ts`):
 *  - the snake's starting row is free for the snake's body and the first
 *    columns ahead of it, so a new game never ends instantly;
 *  - every free cell can be reached from every other one (the field wraps
 *    around its edges), so food can never spawn in a closed pocket.
 */
export interface Maze {
  name: string
  layout: readonly string[]
  /** Wall cells, parsed from `layout`. */
  walls: readonly Point[]
}

const WALL = '#'

const parseMaze = (name: string, layout: readonly string[]): Maze => {
  if (layout.length !== GRID_ROWS) {
    throw new Error(
      `Maze "${name}" has ${layout.length} rows, expected ${GRID_ROWS}`
    )
  }

  const walls: Point[] = []
  layout.forEach((row, y) => {
    if (row.length !== GRID_COLUMNS) {
      throw new Error(
        `Maze "${name}", row ${y} has ${row.length} columns, expected ${GRID_COLUMNS}`
      )
    }
    ;[...row].forEach((char, x) => {
      if (char === WALL) walls.push({ x, y })
    })
  })

  return { name, layout, walls }
}

const LAYOUTS: ReadonlyArray<
  readonly [name: string, layout: readonly string[]]
> = [
  ['None', Array.from({ length: GRID_ROWS }, () => '.'.repeat(GRID_COLUMNS))],
  [
    'Frame',
    [
      '##########....##########',
      '#......................#',
      '#......................#',
      '#......................#',
      '........................',
      '........................',
      '........................',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '##########....##########',
    ],
  ],
  [
    'Pillars',
    [
      '........................',
      '........................',
      '...##....##....##....##.',
      '...##....##....##....##.',
      '........................',
      '........................',
      '........................',
      '........................',
      '......##....##....##....',
      '......##....##....##....',
      '........................',
      '...##....##....##....##.',
      '...##....##....##....##.',
      '........................',
    ],
  ],
  [
    'Bars',
    [
      '........................',
      '........................',
      '...##################...',
      '........................',
      '........................',
      '........................',
      '........................',
      '........................',
      '........############....',
      '........................',
      '........................',
      '...##################...',
      '........................',
      '........................',
    ],
  ],
  [
    'Crosses',
    [
      '.....#............#.....',
      '.....#............#.....',
      '...#####........#####...',
      '.....#............#.....',
      '.....#............#.....',
      '........................',
      '........................',
      '........................',
      '.....#............#.....',
      '.....#............#.....',
      '...#####........#####...',
      '.....#............#.....',
      '.....#............#.....',
      '........................',
    ],
  ],
  [
    'Corners',
    [
      '........................',
      '..######........######..',
      '..#..................#..',
      '..#..................#..',
      '..#..................#..',
      '........................',
      '........................',
      '........................',
      '........................',
      '..#..................#..',
      '..#..................#..',
      '..#..................#..',
      '..######........######..',
      '........................',
    ],
  ],
  [
    'Zigzag',
    [
      '............#.......#...',
      '............#.......#...',
      '............#.......#...',
      '............#.......#...',
      '............#.......#...',
      '....................#...',
      '........#.......#...#...',
      '........#.......#...#...',
      '........#.......#...#...',
      '........#.......#.......',
      '........#.......#.......',
      '........#.......#.......',
      '........#.......#.......',
      '........#.......#.......',
    ],
  ],
  [
    // Sealed on all sides: there are no gaps in the border, so the snake can
    // never wrap around the screen. It has to find its way through the lanes.
    'Labyrinth',
    [
      '########################',
      '#......................#',
      '#.######..........####.#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#.####..........######.#',
      '#.....#..........#.....#',
      '#.....#..........#.....#',
      '#.######..####..######.#',
      '#......................#',
      '#......................#',
      '#......................#',
      '########################',
    ],
  ],
]

export const MAZES: readonly Maze[] = LAYOUTS.map(([name, layout]) =>
  parseMaze(name, layout)
)

/** Index of the maze with no walls. */
export const NO_MAZE = 0

/** Fast lookup of wall cells, one set per maze, keyed by `y * GRID_COLUMNS + x`. */
const wallSets: ReadonlyArray<ReadonlySet<number>> = MAZES.map(
  (maze) => new Set(maze.walls.map(({ x, y }) => y * GRID_COLUMNS + x))
)

export const clampMaze = (maze: number): number =>
  Number.isInteger(maze) && maze >= 0 && maze < MAZES.length ? maze : NO_MAZE

export const getMaze = (maze: number): Maze => MAZES[clampMaze(maze)]

export const isWall = (maze: number, { x, y }: Point): boolean =>
  wallSets[clampMaze(maze)].has(y * GRID_COLUMNS + x)
