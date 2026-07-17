import { PostsPage } from './pages/PostsPage';
import { PostPage } from './pages/PostPage';
import { RootLayout } from './pages/RootLayout';
import { NotFound } from './pages/NotFound';
import App from './App';
import { RootRoute, Route, createRouter } from '@tanstack/react-router';

const rootRoute = new RootRoute({
  component: RootLayout,
  notFoundComponent: () => <NotFound />,
  errorComponent: ({ error }) => <NotFound />,
});

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: App,
});

const postsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/posts/$page',
  component: PostsPage,
});

const postRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/post/$id',
  component: PostPage,
});

const routeTree = rootRoute.addChildren([indexRoute, postsRoute, postRoute]);

export const router = createRouter({
  routeTree,
  notFoundComponent: NotFound,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
