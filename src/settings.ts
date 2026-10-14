import {
  DEFAULT_SPEED,
  MAX_SPEED,
  MIN_SPEED,
  SETTINGS_STORAGE_KEY,
} from 'src/constants'
import { NO_MAZE, clampMaze } from 'src/mazes'
import type { GameSettings } from 'src/types'

/** Clamps a requested speed to the supported levels. */
export const clampSpeed = (speed: number): number =>
  Number.isFinite(speed)
    ? Math.min(MAX_SPEED, Math.max(MIN_SPEED, Math.round(speed)))
    : MIN_SPEED

export const DEFAULT_SETTINGS: GameSettings = {
  speed: DEFAULT_SPEED,
  maze: NO_MAZE,
}

/** Reads the saved settings. Falls back to the defaults if absent or corrupt. */
export const loadSettings = (
  storage: Storage | undefined = safeStorage()
): GameSettings => {
  try {
    const raw = storage?.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed: Partial<Record<keyof GameSettings, unknown>> = JSON.parse(raw)
    return {
      speed:
        typeof parsed.speed === 'number'
          ? clampSpeed(parsed.speed)
          : DEFAULT_SETTINGS.speed,
      maze:
        typeof parsed.maze === 'number'
          ? clampMaze(parsed.maze)
          : DEFAULT_SETTINGS.maze,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export const saveSettings = (
  settings: GameSettings,
  storage: Storage | undefined = safeStorage()
): void => {
  try {
    storage?.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Storage can be unavailable (private mode, quota); settings just won't persist.
  }
}

function safeStorage(): Storage | undefined {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}
