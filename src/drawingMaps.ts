import type { Sprite } from 'src/types'

export const food: Sprite = [' x  ', 'x x ', ' x  ', '    ']

export const wall: Sprite = ['xxxx', 'xxxx', 'xxxx', 'xxxx']

export const bonus: readonly Sprite[] = [
  ['xx   x  ', 'xx  xxx ', '  xxxxxx', '    x x '],
  ['  xx    ', ' x xx x ', 'xxxxxxx ', '  xxxx  '],
  ['  xxxx  ', 'xxxxxxxx', 'x xxxx x', 'x x  x x'],
  [' x x x  ', 'x xxxxx ', 'xxxxxxxx', '  x  x  '],
  ['        ', 'x       ', 'xxxxxxxx', ' x x x x'],
  ['    xx  ', 'x  xx x ', 'x xxxxx ', ' xxxxxxx'],
]

type DirectionalSprites = Record<'left' | 'right' | 'up' | 'down', Sprite>
type TurnSprites = Record<
  'upLeft' | 'upRight' | 'downLeft' | 'downRight',
  Sprite
>

export const snake: {
  head: DirectionalSprites
  headWithMouthOpen: DirectionalSprites
  body: DirectionalSprites
  bodyWithFood: DirectionalSprites
  bodyTurning: TurnSprites
  bodyTurningWithFood: TurnSprites
  tail: DirectionalSprites
} = {
  head: {
    left: ['   x', ' xx ', ' xxx', '    '],
    right: ['x   ', ' xx ', 'xxx ', '    '],
    up: ['    ', ' xx ', ' xx ', 'x x '],
    down: ['x x ', ' xx ', ' xx ', '    '],
  },
  headWithMouthOpen: {
    left: [' x x', '  x ', '  xx', ' x  '],
    right: ['x x ', ' x  ', 'xx  ', '  x '],
    up: ['    ', 'x  x', ' xx ', 'x x '],
    down: ['x x ', ' xx ', 'x  x', '    '],
  },
  body: {
    left: ['    ', 'x xx', 'xx x', '    '],
    right: ['    ', 'xx x', 'x xx', '    '],
    up: [' xx ', '  x ', ' x  ', ' xx '],
    down: [' xx ', ' x  ', '  x ', ' xx '],
  },
  bodyWithFood: {
    left: [' xx ', 'x xx', 'xx x', ' xx '],
    right: [' xx ', 'xx x', 'x xx', ' xx '],
    up: [' xx ', 'x xx', 'xx x', ' xx '],
    down: [' xx ', 'xx x', 'x xx', ' xx '],
  },
  bodyTurning: {
    upRight: ['    ', '  xx', ' x x', ' xx '],
    upLeft: ['    ', 'xx  ', 'x x ', ' xx '],
    downLeft: [' xx ', 'x x ', 'xx  ', '    '],
    downRight: [' xx ', ' x x', '  xx', '    '],
  },
  bodyTurningWithFood: {
    upRight: ['    ', '  xx', ' x x', ' xxx'],
    upLeft: ['    ', 'xx  ', 'x x ', 'xxx '],
    downLeft: ['xxx ', 'x x ', 'xx  ', '    '],
    downRight: [' xxx', ' x x', '  xx', '    '],
  },
  tail: {
    left: ['    ', 'xx  ', 'xxxx', '    '],
    right: ['    ', '  xx', 'xxxx', '    '],
    up: [' xx ', ' xx ', '  x ', '  x '],
    down: ['  x ', '  x ', ' xx ', ' xx '],
  },
}

export const numbers: readonly Sprite[] = [
  ['xxx ', 'x x ', 'x x ', 'x x ', 'xxx '],
  [' x ', 'xx ', ' x ', ' x ', ' x '],
  ['xxx ', '  x ', 'xxx ', 'x   ', 'xxx '],
  ['xxx ', '  x ', 'xxx ', '  x ', 'xxx '],
  ['x x ', 'x x ', 'xxx ', '  x ', '  x '],
  ['xxx ', 'x   ', 'xxx ', '  x ', 'xxx '],
  ['xxx ', 'x   ', 'xxx ', 'x x ', 'xxx '],
  ['xxx ', '  x ', ' x  ', ' x  ', ' x  '],
  ['xxx ', 'x x ', 'xxx ', 'x x ', 'xxx '],
  ['xxx ', 'x x ', 'xxx ', '  x ', 'xxx '],
]
