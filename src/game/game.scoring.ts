import {
  BONUS_LIFETIME_TICKS,
  MAX_SPEED,
  SCORE_PER_SPEED_UP,
} from 'src/constants'

/** Points for one piece of food: the current speed level. */
export const getFoodScore = (speed: number): number => speed

/**
 * Points for a bonus. Higher speed is worth more, and every tick the bonus
 * spent on screen costs 2 points.
 */
export const getBonusScore = (
  speed: number,
  countdownToRemoveBonus: number
): number => {
  const ticksOnScreen = BONUS_LIFETIME_TICKS - countdownToRemoveBonus
  return 5 * (speed + 9) - 2 * ticksOnScreen
}

/** How many speed levels the score has earned: one for every SCORE_PER_SPEED_UP points. */
export const getSpeedBoost = (score: number): number =>
  Math.floor(score / SCORE_PER_SPEED_UP)

/** The speed the game really runs at: the chosen speed plus the boost, up to MAX_SPEED. */
export const getCurrentSpeed = (speed: number, speedBoost: number): number =>
  Math.min(MAX_SPEED, speed + speedBoost)
