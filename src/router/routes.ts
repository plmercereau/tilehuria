import { RouteConfig } from 'vue-router'

const routes: RouteConfig[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      {
        path: 'login',
        component: () => import('pages/Login.vue'),
        meta: { roles: ['anonymous'] }
      },
      { path: 'register', component: () => import('pages/Registration.vue') },
      {
        path: 'areas-of-interest',
        component: () => import('pages/ListAreasOfInterest.vue'),
        meta: { roles: ['user'] }
      },
      {
        path: 'areas-of-interest/new',
        component: () => import('pages/AreaOfInterest.vue'),
        meta: { roles: ['user'] }
      },
      {
        path: 'areas-of-interest/:id',
        props: true,
        component: () => import('pages/AreaOfInterest.vue'),
        meta: { roles: ['user'] }
      },
      {
        path: 'tile-providers',
        component: () => import('pages/ListProviders.vue'),
        meta: { roles: ['user'] }
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
