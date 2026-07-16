import { PostsPage } from './pages/PostsPage';
import { PostPage } from './pages/PostPage';
import { RootLayout } from './pages/RootLayout';
import { NotFound } from './pages/NotFound';
import App from './App';
import { RootRoute, Route, createRouter } from '@tanstack/react-router';

const rootRoute = new RootRoute({
  component: RootLayout,
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

const notFoundRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFound,
});

const routeTree = rootRoute.addChildren([indexRoute, postsRoute, postRoute, notFoundRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
