import React, { StrictMode, useId } from 'react'
import ReactDOM from 'react-dom/client'
import {
  Outlet,
  RouterProvider,
  Link,
  Router,
  Route,
  RootRoute,
  ScrollRestoration,
  useElementScrollRestoration,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { useVirtualizer } from '@tanstack/react-virtual'

const rootRoute = new RootRoute({
  component: RootComponent,
})

function RootComponent() {
  // const {
  //   state: { location, resolvedLocation },
  // } = useRouter()
  return (
    <>
      <div className="p-2 flex gap-2 sticky top-0 bg-white border-b">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>{' '}
        <Link to="/about" className="[&.active]:font-bold">
          About
        </Link>
        <Link to="/about" resetScroll={false}>
          About (No Reset)
        </Link>
        <Link to="/by-element" className="[&.active]:font-bold">
          By-Element
        </Link>
      </div>
      {/* <pre className="text-[.5rem]">
          <code>{JSON.stringify({ resolvedLocation, location }, null, 2)}</code>
        </pre> */}
      <Outlet />
      <ScrollRestoration />
      <TanStackRouterDevtools />
    </>
  )
}

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  loader: () => new Promise((r) => setTimeout(r, 500)),
  component: IndexComponent,
})

function IndexComponent() {
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      <div className="space-y-2">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="h-[100px] p-2 rounded-lg bg-gray-100 border">
            Home Item {i + 1}
          </div>
        ))}
      </div>
    </div>
  )
}

const aboutRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/about',
  loader: () => new Promise((r) => setTimeout(r, 500)),
  component: AboutComponent,
})

function AboutComponent() {
  return (
    <div className="p-2">
      <div>Hello from About!</div>
      <div className="space-y-2">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="h-[100px] p-2 rounded-lg bg-gray-100 border">
            About Item {i + 1}
          </div>
        ))}
      </div>
    </div>
  )
}

const byElementRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/by-element',
  loader: () => new Promise((r) => setTimeout(r, 500)),
  component: ByElementComponent,
})

function ByElementComponent() {
  // We need a unique ID for manual scroll restoration on a specific element
  // It should be as unique as possible for this element across your app
  const scrollRestorationId = 'myVirtualizedContent'

  // We use that ID to get the scroll entry for this element
  const scrollEntry = useElementScrollRestoration({
    id: scrollRestorationId,
  })

  // Let's use TanStack Virtual to virtualize some content!
  const virtualizerParentRef = React.useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: 10000,
    getScrollElement: () => virtualizerParentRef.current,
    estimateSize: () => 100,
    // We pass the scrollY from the scroll restoration entry to the virtualizer
    // as the initial offset
    initialOffset: scrollEntry?.scrollY,
  })

  return (
    <div className="p-2 h-[calc(100vh-41px)] flex flex-col">
      <div>Hello from By-Element!</div>
      <div className="h-full min-h-0 flex gap-4">
        <div className="border rounded-lg p-2 overflow-auto flex-1 space-y-2">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="h-[100px] p-2 rounded-lg bg-gray-100 border"
            >
              About Item {i + 1}
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-auto flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex-1 border rounded-lg p-2 overflow-auto">
              <div className="space-y-2">
                {Array.from({ length: 50 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[100px] p-2 rounded-lg bg-gray-100 border"
                  >
                    About Item {i + 1}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="font-bold">Virtualized</div>
            <div
              ref={virtualizerParentRef}
              // We pass the scroll restoration ID to the element
              // as a custom attribute that will get picked up by the
              // scroll restoration watcher
              data-scroll-restoration-id={scrollRestorationId}
              className="flex-1 border rounded-lg overflow-auto relative"
            >
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                }}
              >
                {virtualizer.getVirtualItems().map((item) => (
                  <div
                    key={item.index}
                    className="absolute p-2 pb-0 w-full"
                    style={{
                      height: item.size,
                      top: item.start,
                    }}
                  >
                    <div className="p-2 rounded-lg bg-gray-100 border h-full">
                      Virtualized Item {item.index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  byElementRoute,
])

const router = new Router({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}
