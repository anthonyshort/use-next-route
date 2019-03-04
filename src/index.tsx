import React, { useEffect, createContext, useContext } from 'react'
import Router from 'next/router'
import qs from 'query-string'

const RouterContext = createContext<RouterContextValue | null>(null)

export type RouterContextValue = {
  currentRoute?: string
  routePrefix?: string
}

type ProviderProps = {
  children: React.ReactNode
  route?: string
  routePrefix?: string
}

type Query = {
  [key: string]: any
}

export type UrlObject = {
  pathname: string
  query?: Query
}

export type RouteOptions = {
  prefetch?: boolean
  replace?: boolean
  as?: UrlObject
}

function RouterProvider(props: ProviderProps) {
  return (
    <RouterContext.Provider
      value={{
        currentRoute: props.route,
        routePrefix: props.routePrefix
      }}
    >
      {props.children}
    </RouterContext.Provider>
  )
}

function urlObjectToString(url: UrlObject) {
  const query = url.query ? `?${qs.stringify(url.query)}` : ''
  return `${url.pathname}${query}`
}

function usePrefetch(href: string, shouldPrefetch: boolean) {
  useEffect(
    () => {
      if (shouldPrefetch) Router.prefetch(href)
    },
    [href, shouldPrefetch]
  )
}

function useRouterContext() {
  const context = useContext(RouterContext)

  if (!context) {
    throw new Error('Missing RouteContext. Did you forget to use <RouteProvider>?')
  }

  return context
}

function wantsNewTab(e: React.MouseEvent) {
  return (
    e.metaKey ||
    e.ctrlKey ||
    e.shiftKey ||
    (e.nativeEvent && e.nativeEvent.which === 2)
  )
}

function parseRoute(url: UrlObject | string): UrlObject {
  if (typeof url === 'string') {
    return {
      pathname: url
    }
  }
  return url
}

function getUrlObjects(
  url: UrlObject | string,
  options: RouteOptions,
  prefix?: string
): {
  route: UrlObject
  alias: UrlObject
} {
  const route = parseRoute(url)
  const alias = parseRoute(options.as || route)
  return {
    route: {
      pathname: route.pathname,
      query: route.query
    },
    alias: {
      pathname: prefix ? prefix + alias.pathname : alias.pathname,
      query: route.query
    }
  }
}

function useRoute(url: UrlObject | string, options: RouteOptions = {}) {
  const { currentRoute, routePrefix } = useRouterContext()
  const { route, alias } = getUrlObjects(url, options, routePrefix)
  const href = urlObjectToString(route)
  const aliasHref = urlObjectToString(alias)
  const shouldScroll = route.pathname.indexOf('#') < 0
  const isActive = currentRoute && currentRoute.startsWith(route.pathname)
  const changeType = options.replace ? 'replace' : 'push'

  usePrefetch(href, options.prefetch === true)

  function onClick(e: React.MouseEvent) {
    if (wantsNewTab(e)) return
    e.preventDefault()
    navigate()
  }

  async function navigate() {
    const success = await Router[changeType](route, alias)
    if (success && shouldScroll) {
      window.scrollTo(0, 0)
      document.body.focus()
    }
  }

  return {
    onClick,
    href: aliasHref,
    isActive,
    navigate
  }
}

export { useRoute, useRouterContext, usePrefetch, RouterProvider }
