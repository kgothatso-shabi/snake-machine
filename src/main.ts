import { interpret } from 'xstate'

import { createGameMachine } from 'src/game/game.machine'
import { bindKeyboard, bindSwipe, bindTouchControls } from 'src/input'
import { MAZES } from 'src/mazes'
import { loadSettings, saveSettings } from 'src/settings'
import { bindSettingsPanel } from 'src/ui'

const game = interpret(createGameMachine(loadSettings()))

const send = game.send.bind(game)

bindKeyboard(send, () => {
  const { speed, maze } = game.getSnapshot().context
  return { speed, maze, mazeCount: MAZES.length }
})
bindTouchControls(document.querySelector<HTMLElement>('#touch-controls')!, send)
bindSwipe(document.querySelector<HTMLElement>('canvas')!, send)
bindSettingsPanel(game, saveSettings)

game.start()
game.send('PLAY')
