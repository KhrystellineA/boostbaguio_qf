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
        component: () => import('pages/AuthPage.vue'),
        meta: { requiresGuest: true } // Only accessible when NOT logged in
      },
      {
        path: '/account',
        component: () => import('pages/AccountPage.vue'),
        meta: { requiresAuth: true } // ✅ REMOVED userOnly - admins can access too
      },
      {
        path: '/contact',
        component: () => import('pages/ContactPage.vue'),
      },
      {
        path: '/saved-routes',
        component: () => import('pages/SavedRoutesPage.vue'),
        meta: { requiresAuth: true, requiresPremium: true } // ✅ REMOVED userOnly
      },
      {
        path: '/offline',
        component: () => import('pages/OfflinePage.vue'),
        meta: { requiresAuth: true, requiresPremium: true } // ✅ REMOVED userOnly
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
        component: () => import('pages/admin/AdminLogin.vue'),
        meta: { requiresGuest: true } // Only accessible when NOT logged in
      },
      {
        path: 'signup',
        name: 'AdminSignup',
        component: () => import('pages/admin/AdminSignup.vue'),
        meta: { requiresGuest: true }
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('pages/admin/AdminDashboard.vue'),
        meta: { requiresAuth: true, requiresAdmin: true } // Admins only
      },
    ]
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes