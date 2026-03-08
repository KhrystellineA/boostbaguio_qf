const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue'),
        meta: {
          title: 'Boost Baguio - Your Premium City Navigation App',
          description:
            'Navigate Baguio City with ease using APANAM jeepney routes, MAYKAN tourist spots, ARAMIDEM events calendar, and AYAN MO nearby places. Your complete Baguio travel companion.',
        },
      },
      {
        path: 'pagnaam',
        component: () => import('pages/PagnaamPage.vue'),
        meta: {
          title: 'PAGNAAM - Jeepney Routes Directory | Boost Baguio',
          description:
            'Browse all jeepney routes in Baguio City. Find terminals, routes, and destinations with detailed information for each route.',
        },
      },
      {
        path: 'maykan',
        component: () => import('pages/MaykanPage.vue'),
        meta: {
          title: 'MAYKAN - Tourist Spots & Places | Boost Baguio',
          description:
            'Discover beautiful tourist spots and places in Baguio City. Find attractions, restaurants, hotels, and more with photos and details.',
        },
      },
      {
        path: 'aramidem',
        component: () => import('pages/AramidemPage.vue'),
        meta: {
          title: 'ARAMIDEM - Events Calendar | Boost Baguio',
          description:
            'Stay updated with events in Baguio City. Browse upcoming events, festivals, concerts, and activities happening around the city.',
        },
      },
      {
        path: 'apanam',
        component: () => import('pages/ApanamPage.vue'),
        meta: {
          title: 'APANAM - Point to Point Navigation | Boost Baguio',
          description:
            'Plan your route between any two points in Baguio City. Get step-by-step jeepney navigation with route details and transfers.',
        },
      },
      {
        path: 'ayanmo',
        component: () => import('pages/AyanMoPage.vue'),
        meta: {
          title: 'AYAN MO - Near Me Location Search | Boost Baguio',
          description:
            'Find places near your location in Baguio City. Discover restaurants, shops, attractions, and services nearby with real-time location.',
        },
      },
      {
        path: '/login',
        component: () => import('pages/AuthPage.vue'),
        meta: {
          requiresGuest: true,
          title: 'Login - Boost Baguio',
          description:
            'Sign in to your Boost Baguio account to access premium features, saved routes, and offline mode.',
        },
      },
      {
        path: '/account',
        component: () => import('pages/AccountPage.vue'),
        meta: {
          requiresAuth: true,
          title: 'My Account - Boost Baguio',
          description: 'Manage your Boost Baguio account settings, preferences, and subscription.',
        },
      },
      {
        path: '/saved-routes',
        component: () => import('pages/SavedRoutesPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPremium: true,
          title: 'Saved Routes - Boost Baguio',
          description: 'Access your saved jeepney routes for quick navigation in Baguio City.',
        },
      },
      {
        path: '/offline',
        component: () => import('pages/OfflinePage.vue'),
        meta: {
          requiresAuth: true,
          requiresPremium: true,
          title: 'Offline Mode - Boost Baguio',
          description:
            'Download routes and places for offline access. Navigate Baguio City without internet connection.',
        },
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
        component: () => import('pages/Admin/AdminLogin.vue'),
        meta: {
          requiresGuest: true,
          title: 'Admin Login - Boost Baguio',
          description: 'Administrator login for Boost Baguio management dashboard.',
        },
      },
      {
        path: 'signup',
        name: 'AdminSignup',
        component: () => import('pages/Admin/AdminSignup.vue'),
        meta: {
          requiresGuest: true,
          title: 'Admin Signup - Boost Baguio',
          description: 'Create administrator account for Boost Baguio management.',
        },
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('pages/Admin/AdminDashboard.vue'),
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          title: 'Admin Dashboard - Boost Baguio',
          description:
            'Manage routes, places, events, and users in the Boost Baguio admin dashboard.',
        },
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
    meta: {
      title: 'Page Not Found - Boost Baguio',
      description: 'The page you are looking for does not exist.',
    },
  },
]

export default routes
