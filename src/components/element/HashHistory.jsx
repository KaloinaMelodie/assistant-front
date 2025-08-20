import { useEffect, useRef, useCallback, useState } from "react"

export function useHashHistory() {
  const [location, setLocation] = useState(getLocation())
  const indexRef = useRef(0)
  const locationListeners = useRef(new Set())
  const blockerListeners = useRef(new Set())
  const ignoringPopstateRef = useRef(0)

  // Get current location from hash
  function getLocation() {
    const uri = (window.location.hash || "#").substring(1)
    const match = uri.match(/^(.*?)(\?.*?)?(#.*)?$/)
    return {
      pathname: match?.[1] || "/",
      search: match?.[2] || "",
      hash: match?.[3] || "",
      uri: uri || "/",
      index: indexRef.current
    }
  }

  const notifyListeners = (loc) => {
    locationListeners.current.forEach((listener) => listener(loc))
  }

  const checkBlockers = async (newLocation) => {
    for (const listener of blockerListeners.current) {
      if (await listener(location, newLocation)) {
        return true
      }
    }
    return false
  }

  const handlePopstate = useCallback(async (ev) => {
    if (ignoringPopstateRef.current > 0) {
      ignoringPopstateRef.current--
      return
    }

    const delta = ev.state === null ? 1 : ev.state - indexRef.current
    indexRef.current += delta

    const newLocation = getLocation()
    const blocked = await checkBlockers(newLocation)
    if (blocked) {
      ignoringPopstateRef.current++
      indexRef.current -= delta
      history.go(-delta)
      return
    }

    history.replaceState(indexRef.current, "")
    setLocation(newLocation)
    notifyListeners(newLocation)
  }, [location])

  useEffect(() => {
    history.replaceState(0, "", window.location.hash || "#/")
    window.addEventListener("popstate", handlePopstate)
    return () => window.removeEventListener("popstate", handlePopstate)
  }, [handlePopstate])

  const push = async (loc, options = {}) => {
    const silent = options.silent ?? false
    const newLoc = parseLocation(loc, indexRef.current + 1)

    if (!silent && (await checkBlockers(newLoc))) return

    indexRef.current += 1
    history.pushState(indexRef.current, "", "#" + newLoc.uri)
    setLocation(newLoc)
    if (!silent) notifyListeners(newLoc)
  }

  const replace = async (loc, options = {}) => {
    const silent = options.silent ?? false
    const newLoc = parseLocation(loc, indexRef.current)

    if (!silent && (await checkBlockers(newLoc))) return

    history.replaceState(indexRef.current, "", "#" + newLoc.uri)
    setLocation(newLoc)
    if (!silent) notifyListeners(newLoc)
  }

  const back = (options = {}) => {
    if (options.silent) ignoringPopstateRef.current++
    history.back()
  }

  const parseLocation = (input, index) => {
    if (typeof input === "string") {
      const uri = input
      const match = uri.match(/^(.*?)(\?.*?)?(#.*)?$/)
      return {
        pathname: match?.[1] || "/",
        search: match?.[2] || "",
        hash: match?.[3] || "",
        uri,
        index
      }
    }

    if ("search" in input) {
      return parseLocation(input.pathname + (input.search || ""), index)
    } else if ("query" in input) {
      const queryStr = Object.entries(input.query || {})
        .map(([k, v]) => `${k}=${encodeURIComponent(v ?? "")}`)
        .join("&")
      return parseLocation(input.pathname + (queryStr ? `?${queryStr}` : ""), index)
    }

    return parseLocation("/", index)
  }

  return {
    location,
    push,
    replace,
    back,
    addLocationListener: (listener) => {
      locationListeners.current.add(listener)
      return () => locationListeners.current.delete(listener)
    },
    addBlockerListener: (listener) => {
      blockerListeners.current.add(listener)
      return () => blockerListeners.current.delete(listener)
    }
  }
}
