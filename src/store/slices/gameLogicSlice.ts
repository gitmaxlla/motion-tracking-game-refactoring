import { createSlice } from '@reduxjs/toolkit'

export const TRAINING_GAME_MODE = 'Training mode'
// REF: Висячая переменная -> убрать
export const NOT_TRAINING_GAME_MODE = 'Not training mode' //придумать позже

interface GameLogicState {
  gameMode: typeof TRAINING_GAME_MODE | typeof NOT_TRAINING_GAME_MODE
}

const initialState: GameLogicState = {
  gameMode: TRAINING_GAME_MODE,
}

export const gameLogicSlice = createSlice({
  name: 'gameLogic',
  initialState,
  reducers: {
    changeGameMode: (state) => {
      // REF: режима всего два в принципе планируется? Зачем тогда два состояния вместо одного boolean?
      //      (switch в любом случае меняем на полиморфизм) 
      //      НАПРИМЕР: делать два класса TraningGameMode и OtherGameMode,
      //                объединить их интерфейсом вроде Changeable с методом change, 
      //                чтобы было просто state.gameMode.change()
      // NOTE: В данном случае switch подразумевает бинарное переключение, хотя change изначально намекает
      //       на какие-то более сложные условия выбора режима игры - как-то размыто получается?
      switch (state.gameMode) {
        case TRAINING_GAME_MODE:
          state.gameMode = NOT_TRAINING_GAME_MODE
          break
        case NOT_TRAINING_GAME_MODE:
          state.gameMode = TRAINING_GAME_MODE
          break
        default:
          break
      }
    },
  },
})

export const { changeGameMode } = gameLogicSlice.actions

export default gameLogicSlice.reducer
