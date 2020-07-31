import { RouteConfig } from 'vue-router'

const routes: RouteConfig[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: 'login', component: () => import('pages/Login.vue') },
      { path: 'register', component: () => import('pages/Registration.vue') },
      {
        path: 'areas-of-interest',
        component: () => import('pages/ListAreasOfInterest.vue')
      },
      {
        path: 'areas-of-interest/new',
        component: () => import('pages/AreaOfInterest.vue')
      },
      {
        path: 'areas-of-interest/:id',
        props: true,
        component: () => import('pages/AreaOfInterest.vue')
      },
      {
        path: 'tile-providers',
        component: () => import('pages/ListProviders.vue')
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
