/** Number of columns / rows on the playing field (one cell = one snake segment). */
export const GRID_COLUMNS = 24
export const GRID_ROWS = 14

/** Where the snake starts: the head's cell and how many segments it has. */
export const INITIAL_SNAKE_HEAD_X = 8
export const INITIAL_SNAKE_Y = 5
export const INITIAL_SNAKE_LENGTH = 8

/** Rendering: one "LCD dot" is SCALE_FACTOR canvas pixels, one cell is GRID_ITEM_SIZE dots. */
export const SCALE_FACTOR = 6
export const GRID_ITEM_SIZE = 4
export const SCREEN_PADDING = 6

/** Monochrome palette: cream white "paper" and black "ink". */
export const BG_COLOR = '#f2ead3'
export const FG_COLOR = '#000000'

/** Speed levels: 1 (slowest) to 25 (fastest). */
export const MIN_SPEED = 1
export const MAX_SPEED = 25
export const DEFAULT_SPEED = 8

/** Every time the score reaches another multiple of this, the snake speeds up one level. */
export const SCORE_PER_SPEED_UP = 300

/** Time between two snake moves is BASE_TICK_MS / speed. */
export const BASE_TICK_MS = 750
export const GAME_OVER_DELAY_MS = 3000
export const BLINK_DELAY_MS = 300

/** Food eaten (with no bonus on screen) before a bonus appears. */
export const FOODS_UNTIL_BONUS = 4
/** Ticks a bonus stays on screen before disappearing. */
export const BONUS_LIFETIME_TICKS = 20

/** How many direction changes can be queued between two ticks. */
export const MAX_KEYSTROKE_BUFFER = 3

export const SETTINGS_STORAGE_KEY = 'snake-ii:settings'
