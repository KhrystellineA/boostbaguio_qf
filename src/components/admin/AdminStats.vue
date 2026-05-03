<template>
  <div class="row q-col-gutter-md q-mb-md">
    <div class="col-12 col-sm-6 col-md-3" v-if="showRoutes">
      <q-card class="stat-card stat-card--featured">
        <q-card-section>
          <div class="row items-start justify-between no-wrap">
            <div class="stat-label">Routes / Jeepneys</div>
            <div class="stat-arrow">
              <q-icon name="north_east" size="16px" />
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
      <q-card class="stat-card">
        <q-card-section>
          <div class="row items-start justify-between no-wrap">
            <div class="stat-label">Places</div>
            <div class="stat-arrow stat-arrow--ghost">
              <q-icon name="north_east" size="16px" />
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
      <q-card class="stat-card">
        <q-card-section>
          <div class="row items-start justify-between no-wrap">
            <div class="stat-label">Events</div>
            <div class="stat-arrow stat-arrow--ghost">
              <q-icon name="north_east" size="16px" />
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
      <q-card class="stat-card">
        <q-card-section>
          <div class="row items-start justify-between no-wrap">
            <div class="stat-label">Admins</div>
            <div class="stat-arrow stat-arrow--ghost">
              <q-icon name="north_east" size="16px" />
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
    box-shadow 0.25s ease;
  overflow: hidden;

  :deep(.q-card__section) {
    padding: 22px 22px 20px;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
  }
}

.stat-card--featured {
  background: linear-gradient(135deg, $primary-green 0%, $dark-green 100%);
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 8px 24px rgba($primary-green, 0.25);

  .stat-label {
    color: rgba(255, 255, 255, 0.85);
  }

  .stat-value {
    color: #ffffff;
  }

  .stat-trend {
    color: rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.15);
  }

  .stat-arrow {
    background: rgba(255, 255, 255, 0.18);
    color: #ffffff;
  }

  &:hover {
    box-shadow: 0 14px 32px rgba($primary-green, 0.32);
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
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.2s ease;

  &:hover {
    background: $primary-green;
    color: #ffffff;
    transform: scale(1.05);
  }
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
