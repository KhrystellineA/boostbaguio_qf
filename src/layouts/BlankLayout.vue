<!--
  Empty Quasar layout — used by all admin routes (/admin/*) so admin pages
  can render their own AdminHeader / AdminSidebar without competing with the
  public navbar/footer in MainLayout.vue.
-->
<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'BlankLayout',
}
</script>
