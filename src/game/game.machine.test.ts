import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { interpret } from 'xstate'

import { INITIAL_SNAKE_HEAD_X, INITIAL_SNAKE_Y } from 'src/constants'
import { MAZES } from 'src/mazes'
import { createGameMachine } from './game.machine'

vi.mock('src/renderer', () => ({ renderFrame: vi.fn() }))

const ZIGZAG = MAZES.findIndex((maze) => maze.name === 'Zigzag')

const start = (settings = { speed: 9, maze: 0 }) => {
  const service = interpret(createGameMachine(settings)).start()
  service.send('PLAY')
  return service
}

type Service = ReturnType<typeof start>

const getHead = (service: Service) =>
  service.getSnapshot().context.snake!.getSnapshot()!.context.body[0]

const getLength = (service: Service) =>
  service.getSnapshot().context.snake!.getSnapshot()!.context.body.length

describe('game machine', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Puts every new food in the last free cell, far from the snake's path.
    vi.spyOn(Math, 'random').mockReturnValue(0.999)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('moves the snake one cell per tick', () => {
    const service = start()
    expect(getHead(service)).toMatchObject({
      x: INITIAL_SNAKE_HEAD_X + 1,
      y: INITIAL_SNAKE_Y,
    })
    vi.advanceTimersByTime(84)
    expect(getHead(service).x).toBe(INITIAL_SNAKE_HEAD_X + 2)
  })

  it('ticks slower at a lower speed', () => {
    const service = start({ speed: 1, maze: 0 })
    const before = getHead(service).x
    vi.advanceTimersByTime(700)
    expect(getHead(service).x).toBe(before)
    vi.advanceTimersByTime(100)
    expect(getHead(service).x).toBe(before + 1)
  })

  it('ignores reverse turns and limits the queued turns', () => {
    const service = start()
    service.send({ type: 'KEY_PRESS', key: 'left' }) // reversing is not allowed
    expect(service.getSnapshot().context.keystrokes).toEqual([])
    service.send({ type: 'KEY_PRESS', key: 'up' })
    service.send({ type: 'KEY_PRESS', key: 'left' })
    service.send({ type: 'KEY_PRESS', key: 'down' })
    service.send({ type: 'KEY_PRESS', key: 'left' })
    expect(service.getSnapshot().context.keystrokes).toEqual([
      'up',
      'left',
      'down',
    ])
  })

  it('pauses and resumes', () => {
    const service = start()
    service.send({ type: 'TOGGLE_PAUSE' })
    expect(service.getSnapshot().matches('playing.paused')).toBe(true)

    const paused = getHead(service).x
    vi.advanceTimersByTime(2000)
    expect(getHead(service).x).toBe(paused)

    service.send({ type: 'KEY_PRESS', key: 'up' })
    expect(service.getSnapshot().context.keystrokes).toEqual([])

    service.send({ type: 'TOGGLE_PAUSE' })
    expect(service.getSnapshot().matches('playing.running')).toBe(true)
    vi.advanceTimersByTime(100)
    expect(getHead(service).x).toBe(paused + 1)
  })

  it('crashes into a wall: one tick of grace, then game over', () => {
    const service = start({ speed: 9, maze: ZIGZAG })
    // The wall in column 20 blocks row 5. The head reaches column 19 after 11 ticks.
    vi.advanceTimersByTime(83 * 10 + 10)
    expect(getHead(service)).toMatchObject({ x: 19, y: 5 })
    expect(service.getSnapshot().matches('playing.running')).toBe(true)

    vi.advanceTimersByTime(84) // crash 1: the snake stops
    expect(getHead(service).x).toBe(19)
    expect(service.getSnapshot().matches('playing.running')).toBe(true)

    vi.advanceTimersByTime(84) // crash 2: dead
    expect(service.getSnapshot().matches('gameOver')).toBe(true)
  })

  it('lets the player steer away from a wall during the grace tick', () => {
    const service = start({ speed: 9, maze: ZIGZAG })
    vi.advanceTimersByTime(83 * 10 + 10)
    vi.advanceTimersByTime(84) // stopped in front of the wall
    service.send({ type: 'KEY_PRESS', key: 'down' })
    vi.advanceTimersByTime(84)
    expect(getHead(service)).toMatchObject({ x: 19, y: 6 })
    expect(service.getSnapshot().matches('playing.running')).toBe(true)
  })

  it('starts a new game after game over', () => {
    const service = start({ speed: 9, maze: ZIGZAG })
    vi.advanceTimersByTime(83 * 12 + 20)
    expect(service.getSnapshot().matches('gameOver')).toBe(true)
    vi.advanceTimersByTime(3100)
    expect(service.getSnapshot().matches('playing')).toBe(true)
    expect(getHead(service).x).toBeLessThan(12)
  })

  it('restarts with the new maze or speed, but only if they change', () => {
    const service = start({ speed: 25, maze: 0 })
    vi.advanceTimersByTime(500)
    const moved = getHead(service).x

    service.send({ type: 'SET_MAZE', maze: 0 })
    service.send({ type: 'SET_SPEED', speed: 25 })
    service.send({ type: 'SET_SPEED', speed: 40 }) // clamps to 25: unchanged
    expect(getHead(service).x).toBe(moved)

    service.send({ type: 'SET_MAZE', maze: ZIGZAG })
    expect(service.getSnapshot().context.maze).toBe(ZIGZAG)
    expect(getHead(service).x).toBe(INITIAL_SNAKE_HEAD_X + 1)
    expect(getLength(service)).toBe(8)

    service.send({ type: 'SET_SPEED', speed: 3 })
    expect(service.getSnapshot().context.speed).toBe(3)
    expect(service.getSnapshot().context.score).toBe(0)

    service.send({ type: 'SET_SPEED', speed: -4 })
    expect(service.getSnapshot().context.speed).toBe(1)
  })

  it('restarts on demand, also while paused', () => {
    const service = start()
    vi.advanceTimersByTime(500)
    service.send({ type: 'TOGGLE_PAUSE' })
    service.send({ type: 'RESTART' })
    expect(service.getSnapshot().matches('playing.running')).toBe(true)
    expect(getHead(service).x).toBe(INITIAL_SNAKE_HEAD_X + 1)
  })

  it('eats food, grows and scores the current speed', () => {
    // Food goes to the first free cell instead: (0, 0). Steer the snake there.
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const service = start({ speed: 9, maze: 0 })
    expect(service.getSnapshot().context.score).toBe(0)

    // Head (9, 5) heading right. Go up 5 rows to y=0, then left until x=0.
    service.send({ type: 'KEY_PRESS', key: 'up' })
    vi.advanceTimersByTime(84 * 5) // reaches row 0 at x = 9
    service.send({ type: 'KEY_PRESS', key: 'left' })
    vi.advanceTimersByTime(84 * 12)
    expect(service.getSnapshot().context.score).toBe(9)
    expect(getLength(service)).toBe(9)
  })

  it('runs up to speed 25', () => {
    const service = start({ speed: 25, maze: 0 })
    const before = getHead(service).x
    vi.advanceTimersByTime(30 * 4 + 5) // 750 / 25 = 30 ms per move
    expect(getHead(service).x).toBe(before + 4)
  })
})
