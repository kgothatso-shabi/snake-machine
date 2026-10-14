import { createMachine } from 'xstate'
import type { BonusContext } from 'src/types'

/** Holds the position (and look) of the bonus. It has no behaviour, only data. */
const bonusMachine = createMachine<BonusContext>({
  id: 'bonus',
  context: {
    x: 0,
    y: 0,
    spriteIndex: 0,
  },
})

export default bonusMachine
