import { create } from 'zustand'

const useCommonCodeStore = create((set, get) => ({
  codes: {},

  setCodes: (groupCode, list) =>
    set((state) => ({
      codes: { ...state.codes, [groupCode]: list },
    })),

  getCodeList: (groupCode) => get().codes[groupCode] ?? [],
}))

export default useCommonCodeStore
