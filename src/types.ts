import type { ActorRef, State } from 'xstate'

/* -------------------------------------------------------------------------- */
/* Shared primitives                                                          */
/* -------------------------------------------------------------------------- */

export type Direction = 'up' | 'down' | 'left' | 'right'

/** A cell of the playing field. `x` is the column and `y` the row, both 0-based. */
export interface Point {
  x: number
  y: number
}

/** A line of an ASCII sprite; any character other than a space is a lit dot. */
export type Sprite = readonly string[]

/* -------------------------------------------------------------------------- */
/* Snake machine                                                              */
/* -------------------------------------------------------------------------- */

export interface SnakePosition extends Point {
  direction: Direction
  /** True while this segment is "digesting" food (drawn with a bump). */
  withFood?: boolean
}

export interface SnakeContext {
  /** Head first, tail last. */
  body: SnakePosition[]
}

export interface UpdatePositionEvent {
  type: 'UPDATE_POSITION'
  position: SnakePosition
}

export interface EatFoodEvent {
  type: 'EAT_FOOD'
}

export interface EatBonusEvent {
  type: 'EAT_BONUS'
}

export interface CrashEvent {
  type: 'CRASH'
}

export type SnakeEvent =
  | UpdatePositionEvent
  | EatFoodEvent
  | EatBonusEvent
  | CrashEvent

export type SnakeActor = ActorRef<SnakeEvent, State<SnakeContext, SnakeEvent>>

/* -------------------------------------------------------------------------- */
/* Food and bonus machines                                                    */
/* -------------------------------------------------------------------------- */

export interface FoodContext extends Point {}

export interface BonusContext extends Point {
  /** Index into the bonus sprites. A bonus is two cells wide: (x, y) and (x + 1, y). */
  spriteIndex: number
}

export type FoodActor = ActorRef<never, State<FoodContext, never>>
export type BonusActor = ActorRef<never, State<BonusContext, never>>

/* -------------------------------------------------------------------------- */
/* Game machine                                                               */
/* -------------------------------------------------------------------------- */

/** The player-configurable settings. They are persisted between sessions. */
export interface GameSettings {
  /** Speed level, from MIN_SPEED to MAX_SPEED. */
  speed: number
  /** Index into MAZES. 0 means "no maze". */
  maze: number
}

export interface GameContext extends GameSettings {
  snake: SnakeActor | null
  food: FoodActor | null
  bonus: BonusActor | null
  /** Direction changes waiting for the next ticks (oldest first). */
  keystrokes: Direction[]
  /** Extra speed levels earned in this game by scoring (see SCORE_PER_SPEED_UP). Not saved. */
  speedBoost: number
  countdownToBonus: number
  countdownToRemoveBonus: number
  score: number
}

export interface PlayEvent {
  type: 'PLAY'
}

export interface KeyPressEvent {
  type: 'KEY_PRESS'
  key: Direction
}

export interface TogglePauseEvent {
  type: 'TOGGLE_PAUSE'
}

export interface RestartEvent {
  type: 'RESTART'
}

export interface SetSpeedEvent {
  type: 'SET_SPEED'
  speed: number
}

export interface SetMazeEvent {
  type: 'SET_MAZE'
  maze: number
}

export type GameEvent =
  | PlayEvent
  | KeyPressEvent
  | TogglePauseEvent
  | RestartEvent
  | SetSpeedEvent
  | SetMazeEvent

/** What the renderer needs to draw one frame. */
export interface RenderState {
  snake: SnakeContext | null
  food: FoodContext
  bonus?: BonusContext
  maze: number
  score: number
  countdownToRemoveBonus: number
}
