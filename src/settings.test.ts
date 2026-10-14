import { describe, expect, it } from 'vitest'
import { SETTINGS_STORAGE_KEY } from 'src/constants'
import {
  DEFAULT_SETTINGS,
  clampSpeed,
  loadSettings,
  saveSettings,
} from 'src/settings'

const createStorage = (initial: Record<string, string> = {}): Storage => {
  const data = { ...initial }
  return {
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value
    },
  } as unknown as Storage
}

describe('settings', () => {
  it('clamps the speed to 1-25', () => {
    expect(clampSpeed(0)).toBe(1)
    expect(clampSpeed(10)).toBe(10)
    expect(clampSpeed(25)).toBe(25)
    expect(clampSpeed(26)).toBe(25)
    expect(clampSpeed(4.6)).toBe(5)
    expect(clampSpeed(NaN)).toBe(1)
  })

  it('uses defaults when nothing is saved or the data is corrupt', () => {
    expect(loadSettings(createStorage())).toEqual(DEFAULT_SETTINGS)
    expect(
      loadSettings(createStorage({ [SETTINGS_STORAGE_KEY]: '{oops' }))
    ).toEqual(DEFAULT_SETTINGS)
    expect(loadSettings(undefined)).toEqual(DEFAULT_SETTINGS)
  })

  it('saves and loads settings', () => {
    const storage = createStorage()
    saveSettings({ speed: 3, maze: 2 }, storage)
    expect(loadSettings(storage)).toEqual({ speed: 3, maze: 2 })
  })

  it('sanitises out-of-range saved values', () => {
    const storage = createStorage({
      [SETTINGS_STORAGE_KEY]: JSON.stringify({ speed: 50, maze: 99 }),
    })
    expect(loadSettings(storage)).toEqual({ speed: 25, maze: 0 })
  })
})
