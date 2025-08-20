import { useState, useEffect, useRef, useCallback } from "react"

export function useAsyncLoad({ props, isLoadNeeded, load }) {
  const [loading, setLoading] = useState(false)
  const [internalState, setInternalState] = useState({})
  const mountedRef = useRef(false)

  const loadSeqStarted = useRef(0)
  const loadSeqCompleted = useRef(0)
  const prevPropsRef = useRef({})

  const forceLoad = useCallback(() => {
    performLoad(props, prevPropsRef.current)
  }, [props])

  const performLoad = useCallback((newProps, oldProps) => {
    loadSeqStarted.current += 1
    const seq = loadSeqStarted.current

    setLoading(true)

    load(newProps, oldProps, (partialState) => {
      if (!mountedRef.current) return
      if (seq < loadSeqCompleted.current) return

      loadSeqCompleted.current = seq
      setInternalState(partialState)
      if (seq === loadSeqStarted.current) setLoading(false)
    })
  }, [load])

  useEffect(() => {
    mountedRef.current = true
    performLoad(props, {})
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (isLoadNeeded(props, prevPropsRef.current)) {
      performLoad(props, prevPropsRef.current)
    }
    prevPropsRef.current = props
  }, [props, isLoadNeeded, performLoad])

  return {
    loading,
    internalState,
    forceLoad,
  }
}
