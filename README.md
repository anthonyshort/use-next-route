# use-next-route

React hook for easy routing within a Next.js app. 

```ts

import { useRoute } from 'use-next-route'

function ProjectsLink() {
  const { href, onClick } = useRoute('/projects')
  return (
    <a href={href} onClick={onClick}>Projects</a>
  )
}
```

## Why

* As a Next app grows it becomes hard to manage link to all of the different routes. 
* The `next/link` component has an awkward API that was designed pre-hooks.
* The router and link also don't have a concept of a "prefix", which is required when mounting a Next app in a sub-directory. 

## Setup

You'll need to use `RouteContext` to provide the router and an optional `routePrefix` to the React app. 

```ts
import { RouteProvider } from 'use-next-route'
import { withRouter } from 'next/router'

function ProjectsPage(props) {
  return (
    <RouteProvider route={props.router.route} routePrefix="/dashboard">
      <div>My Projects</div>
    </RouteProvider>
  )
}

export default withRouter(ProjectsPage)
```

You'll most likely want to create a custom `_app` rather than doing this on every page.

#### Sub-directory routing

You can use the `routePrefix`  prop to automatically as a prefix to all links. This will be provided as the `as` option to the router. You'll want to use this if you're mounting your Next app on a sub-directory, like `https://myapp.com/dashboard`. 

This is similar to the assetPrefix option.

## API

### `useRoute(route: UrlObject | string, options: RouteOptions)`

```ts
import { useRoute } from 'use-next-route'
```

Returns an object with the following properties:

* `href`: URL string for the route. Usually used for adding a `href` attribute to links.
* `onClick`: This will navigate to the route and handle preventing the default mouse event if needed.
* `isActive`: If the current browser location starts with the `href`. Used for active states.
* `navigate`: Navigate to the route.

You won't use `next/link` or `next/router` directly anymore. Instead you can use the hooks. 

* Buttons: You can use the `onClick` property
* Links: You can use the `href` property and the `onClick` property. The `href` will make it a valid HTML link, allowing users to open to the link in a new tab/window and making it crawlable. Adding the `onClick` prop will trigger a `Router.push` for you automatically.

#### Types 
##### `UrlObject`

* `pathname`: Absolute path to the Next route
* `query`: Object of key/value pairs that will be appended to the url as a query string.

##### `RouteOptions`

* `prefetch`: Prefetch the route. This is disabled by default so you need to opt-in
* `replace`: Uses `replace` instead of `push`. 
* `as`: Allows you to override the url in the location bar. If you're using `routePrefix` this is taken care of for you, but if you want to use a custom alias you can instead. The `routePrefix` will still be applied.

#### Examples:

```ts
import { useRoute } from 'use-next-route'

function Page() {
  const { href, onClick } = useRoute('/projects')
  return (
    <a href={href} onClick={onClick}>Click me!</a>
  )
}

export default ProjectPage
```

Enabling prefetch and replacing instead:

```ts
import { useRoute } from 'use-next-route'

function Page() {
  const { href, onClick } = useRoute('/projects', {
    prefetch: true,
    replace: true
  })
  return (
    <a href={href} onClick={onClick}>Click me!</a>
  )
}

export default ProjectPage
```

Using a `UrlObject` like when you use `Router.push`:

```ts
import { useRoute } from 'use-next-route'

function ProjectPage(props) {
  const projectRoute = useRoute({
    pathname: '/project/details',
    query: {
      id: props.project.id
    }
  })
  return (
    <a href={projectRoute.href} onClick={projectRoute.onClick}>{props.project.name}</a>
  )
}

export default ProjectPage
```

Using a custom hook:

```ts
import { useRoute, RouteOptions } from 'use-next-route'

function useProjectRoute(projectId: string, options?: RouteOptions) {
  return useRoute({
    pathname: '/project/details',
    query: {
      id: projectId
    }
  }, options)
}

function ProjectPage(props) {
  const projectRoute = useProjectRoute(props.project.id, {
    prefetch: true
  })
  return (
    <a href={projectRoute.href} onClick={projectRoute.onClick}>{props.project.name}</a>
  )
}

export default ProjectPage
```

Extracting out the custom hooks into a `routes` file:

```ts
import { RouteOptions, useRoute } from 'use-next-route'

export function useProjectRoute(id, options?: RouteOptions) {
  const route = {
    pathname: '/projects',
    query: {
      id
    }
  }
  return useRoute(route, options)
}

export function useSettingsRoute(options?: RouteOptions) {
  return useRoute('/settings', options)
}
```

```ts
import { useProjectRoute, useSettingsRoute } from './routes'

function Page({ project }) {
  const projectRoute = useProjectRoute(project.id, {
    prefetch: true
  })
  const settingsRoute = useSettingsRoute()
  return (
    <>
      <a href={projectRoute.href} onClick={projectRoute.onClick}>{project.name}</a>
      <a href={settingsRoute.href} onClick={settingsRoute.onClick}>Settings</a>
    </>
  )
}
```

### `RouteProvider`

```ts
import { RouteProvider } from 'use-next-route'
```

Add the context to you app to inject the Next router. This is required for `useRoute` to work. 

```ts
import { RouteProvider } from 'use-next-route'
import { withRouter } from 'next/router'

function ProjectsPage(props) {
  return (
    <RouteProvider route={props.router.route} routePrefix="/dashboard">
      <div>My Projects</div>
    </RouteProvider>
  )
}

export default withRouter(ProjectsPage)
```
