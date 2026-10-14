import { describe, expect, it } from 'vitest'
import { getEventForKey } from 'src/input'

const options = { speed: 5, maze: 2, mazeCount: 7 }

describe('getEventForKey', () => {
  it('maps arrows and WASD to directions', () => {
    expect(getEventForKey('ArrowUp', options)).toEqual({
      type: 'KEY_PRESS',
      key: 'up',
    })
    expect(getEventForKey('a', options)).toEqual({
      type: 'KEY_PRESS',
      key: 'left',
    })
    expect(getEventForKey('D', options)).toEqual({
      type: 'KEY_PRESS',
      key: 'right',
    })
  })

  it('maps control keys', () => {
    expect(getEventForKey('p', options)).toEqual({ type: 'TOGGLE_PAUSE' })
    expect(getEventForKey(' ', options)).toEqual({ type: 'TOGGLE_PAUSE' })
    expect(getEventForKey('r', options)).toEqual({ type: 'RESTART' })
    expect(getEventForKey('+', options)).toEqual({
      type: 'SET_SPEED',
      speed: 6,
    })
    expect(getEventForKey('-', options)).toEqual({
      type: 'SET_SPEED',
      speed: 4,
    })
    expect(getEventForKey('m', options)).toEqual({ type: 'SET_MAZE', maze: 3 })
  })

  it('wraps the maze selection and ignores other keys', () => {
    expect(getEventForKey('m', { ...options, maze: 6 })).toEqual({
      type: 'SET_MAZE',
      maze: 0,
    })
    expect(getEventForKey('x', options)).toBeUndefined()
  })
})
