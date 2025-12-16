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
      {
        path: '/login',
        component: () => import('pages/AuthPage.vue')
      },
      {
        path: '/account',
        component: () => import('pages/AccountPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/saved-routes',
        component: () => import('pages/SavedRoutesPage.vue'),
        meta: { requiresAuth: true, requiresPremium: true }
      },
      {
        path: '/offline',
        component: () => import('pages/OfflinePage.vue'),
        meta: { requiresAuth: true, requiresPremium: true }
      },
    ],
  },


  {
    path: '/admin',
    component: () => import('layouts/BlankLayout.vue'),
    children: [
      {
        path: 'adminlogin',
        name: 'AdminLogin',
        component: () => import('pages/Admin/AdminLogin.vue')
      },
      {
        path: '/admin/signup',
        component: () => import('pages/admin/AdminSignup.vue')
      },
      {
        path: '/admin/dashboard',
        component: () => import('pages/admin/AdminDashboard.vue'),
        meta: { requiresAuth: true }
      },
    ]
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes