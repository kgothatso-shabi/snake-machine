import { assign } from 'xstate'
import type { SnakeContext, SnakeEvent } from 'src/types'

/** Adds the new head. */
export const appendBody = assign<SnakeContext, SnakeEvent>({
  body: (context, event) =>
    event.type === 'UPDATE_POSITION'
      ? [event.position, ...context.body]
      : context.body,
})

/** Marks the head as carrying food, so it is drawn with a bump. */
export const registerFoodEaten = assign<SnakeContext, SnakeEvent>({
  body: (context) =>
    context.body.map((item, i) =>
      i === 0 ? { ...item, withFood: true } : item
    ),
})

/** Drops the tail, so the snake keeps its length while moving. */
export const removeLastBody = assign<SnakeContext, SnakeEvent>({
  body: (context) => context.body.slice(0, -1),
})
