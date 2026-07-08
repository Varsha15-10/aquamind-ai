import { createContext, useContext } from 'react'
import { t as translate } from './translations.js'

const LangContext = createContext({ lang: 'en', setLang: () => {} })

export function LangProvider({ lang, setLang, children }) {
  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}

// Returns a translate function bound to the current language —
// use as: const t = useT(); t('someKey')
export function useT() {
  const { lang } = useContext(LangContext)
  return (key) => translate(lang, key)
}
