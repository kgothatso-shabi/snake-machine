import * as drawingMaps from 'src/drawingMaps'
import {
  BG_COLOR,
  FG_COLOR,
  GRID_COLUMNS,
  GRID_ITEM_SIZE,
  GRID_ROWS,
  SCALE_FACTOR,
  SCREEN_PADDING,
} from 'src/constants'
import { getMaze } from 'src/mazes'
import { getBonusCells, step } from 'src/game/game.selectors'
import type {
  Direction,
  Point,
  RenderState,
  SnakePosition,
  Sprite,
} from 'src/types'

/** Layout, in LCD dots. */
const FIELD_WIDTH_DOTS = GRID_COLUMNS * GRID_ITEM_SIZE
const FIELD_HEIGHT_DOTS = GRID_ROWS * GRID_ITEM_SIZE
const FRAME_WIDTH_DOTS = FIELD_WIDTH_DOTS + 4
const FRAME_HEIGHT_DOTS = FIELD_HEIGHT_DOTS + 4
const CANVAS_WIDTH_DOTS = FIELD_WIDTH_DOTS + SCREEN_PADDING * 3 - 2
const CANVAS_HEIGHT_DOTS = FIELD_HEIGHT_DOTS + SCREEN_PADDING * 4 + 4
const HEADER_DIVIDER_Y = SCREEN_PADDING + 7
const FRAME_TOP = SCREEN_PADDING + 12
const FIELD_X_DOTS = SCREEN_PADDING + 2
const FIELD_Y_DOTS = SCREEN_PADDING + 14
const DIGIT_WIDTH_DOTS = 4

/** Body sprite for a turn, keyed by `${segment direction}-${direction of the segment ahead}`. */
const TURN_SPRITE_KEYS: Partial<
  Record<
    `${Direction}-${Direction}`,
    keyof typeof drawingMaps.snake.bodyTurning
  >
> = {
  'up-left': 'upLeft',
  'right-down': 'upLeft',
  'up-right': 'upRight',
  'left-down': 'upRight',
  'down-left': 'downLeft',
  'right-up': 'downLeft',
  'down-right': 'downRight',
  'left-up': 'downRight',
}

/** Draws the game screen on a canvas. Create it once and call `render` every frame. */
export default class GameRenderer {
  private readonly context: CanvasRenderingContext2D
  /** Size of one LCD dot, in canvas pixels. Follows the size of the canvas on the page. */
  private dot = SCALE_FACTOR
  private lastState: RenderState | undefined

  constructor(private readonly canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas 2D context is not available')
    this.context = context
    this.resize()

    // The screen adapts to the device: redraw with a new dot size whenever the
    // canvas is resized (window resize, rotation, ...).
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(() => {
        if (this.resize() && this.lastState) this.render(this.lastState)
      }).observe(canvas)
    }
  }

  /**
   * Picks the largest whole number of canvas pixels per LCD dot that fills the
   * canvas as displayed (so the dots stay sharp on any screen and pixel ratio).
   * Returns true if the size changed.
   */
  private resize(): boolean {
    const { canvas } = this
    const ratio = globalThis.devicePixelRatio || 1
    const displayWidth = canvas.getBoundingClientRect().width * ratio
    const dot = displayWidth
      ? Math.max(1, Math.round(displayWidth / CANVAS_WIDTH_DOTS))
      : SCALE_FACTOR
    if (dot === this.dot && canvas.width === CANVAS_WIDTH_DOTS * dot) {
      return false
    }
    this.dot = dot
    canvas.width = CANVAS_WIDTH_DOTS * dot
    canvas.height = CANVAS_HEIGHT_DOTS * dot
    return true
  }

  render(state: RenderState): void {
    this.lastState = state
    const { context, canvas } = this
    context.fillStyle = BG_COLOR
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = FG_COLOR

    this.renderHeader(state)
    this.renderFrame()
    this.renderMaze(state.maze)
    this.renderSnake(state)
    this.renderSprite(drawingMaps.food, state.food)
    if (state.bonus) {
      this.renderSprite(drawingMaps.bonus[state.bonus.spriteIndex], state.bonus)
    }
  }

  /* ------------------------------- primitives ------------------------------ */

  /** Draws every lit dot of `sprite`, with its top-left corner at pixel (x, y). */
  private drawSprite(sprite: Sprite, x: number, y: number): void {
    sprite.forEach((line, row) => {
      ;[...line].forEach((char, column) => {
        if (char !== ' ') {
          this.context.fillRect(
            x + column * this.dot,
            y + row * this.dot,
            this.dot,
            this.dot
          )
        }
      })
    })
  }

  /** Draws a sprite in the playing field cell `cell`. */
  private renderSprite(sprite: Sprite, cell: Point): void {
    this.drawSprite(
      sprite,
      (FIELD_X_DOTS + cell.x * GRID_ITEM_SIZE) * this.dot,
      (FIELD_Y_DOTS + cell.y * GRID_ITEM_SIZE) * this.dot
    )
  }

  /** Draws a number with the LCD digits, left-padded with zeros. */
  private drawNumber(
    value: number,
    digits: number,
    x: number,
    y: number
  ): void {
    ;[...String(value).padStart(digits, '0')].forEach((digit, index) => {
      this.drawSprite(
        drawingMaps.numbers[Number(digit)],
        x + index * DIGIT_WIDTH_DOTS * this.dot,
        y
      )
    })
  }

  private fillDots(x: number, y: number, width: number, height: number): void {
    this.context.fillRect(
      x * this.dot,
      y * this.dot,
      width * this.dot,
      height * this.dot
    )
  }

  /* -------------------------------- sections ------------------------------- */

  private renderHeader({
    score,
    bonus,
    countdownToRemoveBonus,
  }: RenderState): void {
    const { dot } = this
    this.drawNumber(score, 4, SCREEN_PADDING * dot, SCREEN_PADDING * dot)

    if (bonus) {
      // The icon sits a third of a dot lower than the digits, as in the original layout.
      this.drawSprite(
        drawingMaps.bonus[bonus.spriteIndex],
        (FIELD_WIDTH_DOTS - 8) * dot,
        SCREEN_PADDING * dot + Math.round(dot / 3)
      )
      this.drawNumber(
        countdownToRemoveBonus,
        2,
        (FIELD_WIDTH_DOTS + SCREEN_PADDING - 4) * dot,
        SCREEN_PADDING * dot
      )
    }

    this.fillDots(SCREEN_PADDING, HEADER_DIVIDER_Y, FRAME_WIDTH_DOTS, 1)
  }

  /** The rectangle around the playing field. */
  private renderFrame(): void {
    const left = SCREEN_PADDING
    const top = FRAME_TOP
    this.fillDots(left, top, FRAME_WIDTH_DOTS, 1) // top
    this.fillDots(left, top + FRAME_HEIGHT_DOTS - 1, FRAME_WIDTH_DOTS, 1) // bottom
    this.fillDots(left, top, 1, FRAME_HEIGHT_DOTS) // left
    this.fillDots(left + FRAME_WIDTH_DOTS - 1, top, 1, FRAME_HEIGHT_DOTS) // right
  }

  private renderMaze(maze: number): void {
    getMaze(maze).walls.forEach((wall) =>
      this.renderSprite(drawingMaps.wall, wall)
    )
  }

  private renderSnake({ snake, food, bonus }: RenderState): void {
    if (!snake) return
    const targets: Point[] = [food, ...(bonus ? getBonusCells(bonus) : [])]

    snake.body.forEach((part, index, body) => {
      const sprite =
        index === 0
          ? this.getHeadSprite(part, targets)
          : index === body.length - 1
          ? drawingMaps.snake.tail[body[body.length - 2].direction]
          : this.getBodySprite(part, body[index - 1].direction)
      if (sprite) this.renderSprite(sprite, part)
    })
  }

  /** The head opens its mouth when food or a bonus is right in front of it. */
  private getHeadSprite(head: SnakePosition, targets: Point[]): Sprite {
    const ahead = step(head, head.direction)
    const mouthOpen = targets.some(({ x, y }) => x === ahead.x && y === ahead.y)
    const sprites = mouthOpen
      ? drawingMaps.snake.headWithMouthOpen
      : drawingMaps.snake.head
    return sprites[head.direction]
  }

  private getBodySprite(
    part: SnakePosition,
    directionAhead: Direction
  ): Sprite | undefined {
    const { withFood, direction } = part
    if (direction === directionAhead) {
      return drawingMaps.snake[withFood ? 'bodyWithFood' : 'body'][direction]
    }
    const turn = TURN_SPRITE_KEYS[`${direction}-${directionAhead}`]
    if (!turn) return undefined
    return drawingMaps.snake[withFood ? 'bodyTurningWithFood' : 'bodyTurning'][
      turn
    ]
  }
}

let renderer: GameRenderer | undefined

/** Draws a frame on the page's `<canvas>`, creating the renderer on first use. */
export const renderFrame = (state: RenderState): void => {
  renderer ??= new GameRenderer(document.querySelector('canvas')!)
  renderer.render(state)
}
