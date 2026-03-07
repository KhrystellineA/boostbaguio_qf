<template>
  <div class="row q-mb-md">
    <div class="col-12 col-sm-6 col-md-3" v-if="showRoutes">
      <q-card class="stat-card">
        <q-card-section>
          <div class="row items-center">
            <div class="col">
              <div class="stat-icon bg-blue-1">
                <q-icon name="directions_bus" size="md" color="blue" />
              </div>
            </div>
            <div class="col text-right">
              <div class="stat-value">{{ stats.routes }}</div>
              <div class="stat-label">Routes / Jeepneys</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-12 col-sm-6 col-md-3" v-if="showPlaces">
      <q-card class="stat-card">
        <q-card-section>
          <div class="row items-center">
            <div class="col">
              <div class="stat-icon bg-green-1">
                <q-icon name="place" size="md" color="green" />
              </div>
            </div>
            <div class="col text-right">
              <div class="stat-value">{{ stats.places }}</div>
              <div class="stat-label">Places</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-12 col-sm-6 col-md-3" v-if="showEvents">
      <q-card class="stat-card">
        <q-card-section>
          <div class="row items-center">
            <div class="col">
              <div class="stat-icon bg-orange-1">
                <q-icon name="event" size="md" color="orange" />
              </div>
            </div>
            <div class="col text-right">
              <div class="stat-value">{{ stats.events }}</div>
              <div class="stat-label">Events</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-12 col-sm-6 col-md-3">
      <q-card class="stat-card">
        <q-card-section>
          <div class="row items-center">
            <div class="col">
              <div class="stat-icon bg-purple-1">
                <q-icon name="people" size="md" color="purple" />
              </div>
            </div>
            <div class="col text-right">
              <div class="stat-value">{{ stats.admins }}</div>
              <div class="stat-label">Admins</div>
            </div>
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
        admins: 0
      })
    },
    showRoutes: {
      type: Boolean,
      default: true
    },
    showPlaces: {
      type: Boolean,
      default: true
    },
    showEvents: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style lang="scss" scoped>
.stat-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #1b4332;
  }

  .stat-label {
    font-size: 13px;
    color: #6c757d;
    font-weight: 500;
  }
}
</style>
