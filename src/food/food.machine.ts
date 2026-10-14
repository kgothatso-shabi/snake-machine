import { createMachine } from 'xstate'
import type { FoodContext } from 'src/types'

/** Holds the position of the food. It has no behaviour, only data. */
const foodMachine = createMachine<FoodContext>({
  id: 'food',
  context: {
    x: 0,
    y: 0,
  },
})

export default foodMachine
