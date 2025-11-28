const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'pagnaam', component: () => import('pages/PagnaamPage.vue') },
      { path: 'maykan', component: () => import('pages/MaykanPage.vue') },
      { path: 'aramidem', component: () => import('pages/AramidemPage.vue') },
      { path: 'apanam', component: () => import('pages/ApanamPage.vue') },
      { path: 'ayanmo', component: () => import('pages/AyanMoPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
