<!--
  Four stat cards at the top of the admin dashboard: Routes / Jeepneys,
  Places, Events, Admins. Each card shows a count and acts as a TOGGLE
  FILTER for the analytics block below. Clicking a card emits
  `toggle-category` with its key; the dashboard adds/removes that category
  from `activeCategories` and passes the array down to AnalyticsManagement.
  Selected cards get a green border + check icon.
  Used by: src/pages/admin/AdminDashboard.vue.
-->
<template>
  <div class="row q-col-gutter-md q-mb-md">
    <div class="col-12 col-sm-6 col-md-3" v-if="showRoutes">
      <q-card
        class="stat-card stat-card--clickable"
        :class="{ 'stat-card--active': isActive('routes') }"
        @click="$emit('toggle-category', 'routes')"
        v-ripple
      >
        <q-card-section>
          <div class="row items-start justify-between no-wrap">
            <div class="stat-label">Routes / Jeepneys</div>
            <div class="stat-arrow">
              <q-icon :name="isActive('routes') ? 'check' : 'directions_bus'" size="16px" />
            </div>
          </div>
          <div class="stat-value">{{ stats.routes }}</div>
          <div class="stat-trend">
            <q-icon name="directions_bus" size="14px" class="q-mr-xs" />
            <span>Active routes</span>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-12 col-sm-6 col-md-3" v-if="showPlaces">
      <q-card
        class="stat-card stat-card--clickable"
        :class="{ 'stat-card--active': isActive('places') }"
        @click="$emit('toggle-category', 'places')"
        v-ripple
      >
        <q-card-section>
          <div class="row items-start justify-between no-wrap">
            <div class="stat-label">Places</div>
            <div class="stat-arrow stat-arrow--ghost">
              <q-icon :name="isActive('places') ? 'check' : 'place'" size="16px" />
            </div>
          </div>
          <div class="stat-value stat-value--dark">{{ stats.places }}</div>
          <div class="stat-trend stat-trend--green">
            <q-icon name="place" size="14px" class="q-mr-xs" />
            <span>Tourist spots</span>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-12 col-sm-6 col-md-3" v-if="showEvents">
      <q-card
        class="stat-card stat-card--clickable"
        :class="{ 'stat-card--active': isActive('events') }"
        @click="$emit('toggle-category', 'events')"
        v-ripple
      >
        <q-card-section>
          <div class="row items-start justify-between no-wrap">
            <div class="stat-label">Events</div>
            <div class="stat-arrow stat-arrow--ghost">
              <q-icon :name="isActive('events') ? 'check' : 'event'" size="16px" />
            </div>
          </div>
          <div class="stat-value stat-value--dark">{{ stats.events }}</div>
          <div class="stat-trend stat-trend--orange">
            <q-icon name="event" size="14px" class="q-mr-xs" />
            <span>Scheduled</span>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-12 col-sm-6 col-md-3">
      <q-card
        class="stat-card stat-card--clickable"
        :class="{ 'stat-card--active': isActive('admins') }"
        @click="$emit('toggle-category', 'admins')"
        v-ripple
      >
        <q-card-section>
          <div class="row items-start justify-between no-wrap">
            <div class="stat-label">Admins</div>
            <div class="stat-arrow stat-arrow--ghost">
              <q-icon :name="isActive('admins') ? 'check' : 'people'" size="16px" />
            </div>
          </div>
          <div class="stat-value stat-value--dark">{{ stats.admins }}</div>
          <div class="stat-trend stat-trend--purple">
            <q-icon name="people" size="14px" class="q-mr-xs" />
            <span>Total members</span>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminStats',

  props: {
    stats: {
      type: Object,
      default: () => ({
        routes: 0,
        places: 0,
        events: 0,
        admins: 0,
      }),
    },
    activeCategories: {
      type: Array,
      default: () => ['places'],
    },
    showRoutes: {
      type: Boolean,
      default: true,
    },
    showPlaces: {
      type: Boolean,
      default: true,
    },
    showEvents: {
      type: Boolean,
      default: true,
    },
  },

  emits: ['toggle-category'],

  methods: {
    isActive(cat) {
      return this.activeCategories.includes(cat)
    },
  },
}
</script>

<style lang="scss" scoped>
$primary-green: #2e5d3e;
$dark-green: #1b4332;
$light-green: #9ec98f;

.stat-card {
  border-radius: 22px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition:
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.25s ease,
    border-color 0.2s ease;
  overflow: hidden;

  :deep(.q-card__section) {
    padding: 22px 22px 20px;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
  }
}

.stat-card--clickable {
  cursor: pointer;
}

.stat-card--active {
  border: 2px solid $primary-green;
  box-shadow: 0 8px 22px rgba($primary-green, 0.18);

  .stat-arrow,
  .stat-arrow--ghost {
    background: $primary-green;
    color: #ffffff;
  }
}

.stat-label {
  font-size: 13px;
  font-weight: 600;
  color: #4a5057;
  letter-spacing: 0.01em;
}

.stat-arrow {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f5f7;
  color: #4a5057;
  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.stat-arrow--ghost {
  background: rgba($primary-green, 0.08);
  color: $primary-green;
}

.stat-value {
  font-size: 38px;
  font-weight: 800;
  margin: 12px 0 14px;
  line-height: 1;
  letter-spacing: -0.02em;
}

.stat-value--dark {
  color: #1d1d1f;
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  background: rgba($primary-green, 0.1);
  color: $primary-green;
  padding: 5px 10px;
  border-radius: 999px;
}

.stat-trend--green {
  background: rgba($primary-green, 0.1);
  color: $primary-green;
}

.stat-trend--orange {
  background: rgba(255, 152, 0, 0.12);
  color: #e67e00;
}

.stat-trend--purple {
  background: rgba(149, 117, 205, 0.15);
  color: #6a3fb5;
}
</style>
