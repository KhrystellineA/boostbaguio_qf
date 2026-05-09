#!/usr/bin/env node
/**
 * Audit jeepney route polylines for structural red flags.
 *
 * Usage:
 *   node scripts/audit-jeepney-routes.js              # offline checks only
 *   node scripts/audit-jeepney-routes.js --osrm       # also compare against fresh OSRM
 *   node scripts/audit-jeepney-routes.js --json out.json
 *
 * Reads every doc in the `jeepneys` Firestore collection and flags routes by
 * structural issues you can spot without ground truth: heading reversals, long
 * inter-point jumps, self-intersections, and excessive total-vs-straight-line
 * distance. With --osrm it also asks the public OSRM server for a fresh
 * driving route through the same waypoints and reports relative length drift.
 *
 * Pure read-only — does not touch Firestore.
 */

import 'dotenv/config'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import { writeFileSync } from 'node:fs'

const args = process.argv.slice(2)
const useOsrm = args.includes('--osrm')
const jsonOutIdx = args.indexOf('--json')
const jsonOut = jsonOutIdx >= 0 ? args[jsonOutIdx + 1] : null

// --- Firebase config from .env (same VITE_* vars the app uses) ---
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('[audit] Missing VITE_FIREBASE_* env vars. Make sure .env is present.')
  process.exit(1)
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// --- Geo helpers ---
const toRad = (d) => (d * Math.PI) / 180
const toDeg = (r) => (r * 180) / Math.PI

/** Haversine distance in meters between two [lat, lng] points. */
const haversine = ([lat1, lng1], [lat2, lng2]) => {
  const R = 6371000
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

/** Compass bearing in degrees from p1 to p2 (lat/lng input). */
const bearing = ([lat1, lng1], [lat2, lng2]) => {
  const φ1 = toRad(lat1)
  const φ2 = toRad(lat2)
  const Δλ = toRad(lng2 - lng1)
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

/** Angular difference 0–180°. */
const angleDiff = (a, b) => {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

/** Polylines in Firestore are [lng, lat]. Normalize to [lat, lng]. */
const toLatLng = (coords) => {
  if (!Array.isArray(coords)) return []
  return coords
    .map((c) => {
      if (Array.isArray(c) && c.length === 2) {
        const [a, b] = c
        // Heuristic: longitude in Baguio is ~120, latitude ~16. If first value
        // is near 120 it's [lng, lat]; otherwise assume [lat, lng].
        if (a > 100 && b < 30) return [b, a]
        return [a, b]
      }
      if (c && typeof c === 'object' && c.lat != null && c.lng != null) return [c.lat, c.lng]
      return null
    })
    .filter(Boolean)
}

// --- Analyzers ---
const SHARP_TURN_DEG = 150
const SHARP_TURN_MAX_LEG_M = 80
const LONG_JUMP_M = 400
const RATIO_THRESHOLD = 3.5
const OSRM_DRIFT_THRESHOLD = 0.25 // 25%

/** Count sharp U-turns: heading reversal across two short adjacent legs. */
const findSharpTurns = (latLngs) => {
  const hits = []
  for (let i = 1; i < latLngs.length - 1; i++) {
    const legA = haversine(latLngs[i - 1], latLngs[i])
    const legB = haversine(latLngs[i], latLngs[i + 1])
    if (legA < 5 || legB < 5) continue
    if (legA > SHARP_TURN_MAX_LEG_M || legB > SHARP_TURN_MAX_LEG_M) continue
    const b1 = bearing(latLngs[i - 1], latLngs[i])
    const b2 = bearing(latLngs[i], latLngs[i + 1])
    const turn = angleDiff(b1, b2)
    if (turn >= SHARP_TURN_DEG) {
      hits.push({ index: i, turnDeg: Math.round(turn), at: latLngs[i] })
    }
  }
  return hits
}

/** Detect adjacent-point jumps that suggest a missing road segment. */
const findLongJumps = (latLngs) => {
  const hits = []
  for (let i = 1; i < latLngs.length; i++) {
    const d = haversine(latLngs[i - 1], latLngs[i])
    if (d > LONG_JUMP_M) hits.push({ index: i, meters: Math.round(d) })
  }
  return hits
}

/** Total polyline length in meters. */
const polylineLength = (latLngs) => {
  let total = 0
  for (let i = 1; i < latLngs.length; i++) total += haversine(latLngs[i - 1], latLngs[i])
  return total
}

/** Lightweight self-intersection counter: how many segment pairs cross. */
const countSelfIntersections = (latLngs) => {
  // O(n²); keep cheap by skipping until n big.
  if (latLngs.length > 1500) return -1
  let count = 0
  const segs = []
  for (let i = 0; i < latLngs.length - 1; i++) segs.push([latLngs[i], latLngs[i + 1]])
  for (let i = 0; i < segs.length; i++) {
    for (let j = i + 2; j < segs.length; j++) {
      // Skip neighboring segs that share a vertex.
      if (j === i + 1) continue
      if (segmentsIntersect(segs[i][0], segs[i][1], segs[j][0], segs[j][1])) count++
    }
  }
  return count
}

const segmentsIntersect = (p1, p2, p3, p4) => {
  const ccw = (a, b, c) => (c[0] - a[0]) * (b[1] - a[1]) - (b[0] - a[0]) * (c[1] - a[1])
  const d1 = ccw(p3, p4, p1)
  const d2 = ccw(p3, p4, p2)
  const d3 = ccw(p1, p2, p3)
  const d4 = ccw(p1, p2, p4)
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
}

/** Optional: ask OSRM for a fresh route through the same waypoints. */
const fetchOsrmLength = async (waypoints) => {
  if (!waypoints || waypoints.length < 2) return null
  const coords = waypoints.map((wp) => `${wp[1]},${wp[0]}`).join(';')
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=false`
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    if (data.code !== 'Ok' || !data.routes?.[0]) return null
    return data.routes[0].distance // meters
  } catch {
    return null
  }
}

// --- Main ---
const auditOne = async (jeep) => {
  const flags = []
  const latLngs = toLatLng(jeep.routeCoordinates || jeep.routePoints)

  if (latLngs.length < 2) {
    flags.push({ type: 'no_polyline', detail: 'No usable routeCoordinates' })
    return { id: jeep.id, name: jeep.jeepName || jeep.routeName, flags, score: 50 }
  }

  // Structural checks
  const turns = findSharpTurns(latLngs)
  if (turns.length > 0) {
    flags.push({ type: 'sharp_uturn', count: turns.length, samples: turns.slice(0, 3) })
  }

  const jumps = findLongJumps(latLngs)
  if (jumps.length > 0) {
    flags.push({
      type: 'long_jump',
      count: jumps.length,
      maxMeters: Math.max(...jumps.map((j) => j.meters)),
    })
  }

  const xings = countSelfIntersections(latLngs)
  if (xings > 0) flags.push({ type: 'self_intersection', count: xings })
  else if (xings === -1) flags.push({ type: 'self_intersection_skipped', count: latLngs.length })

  const totalM = polylineLength(latLngs)
  const start = latLngs[0]
  const end = latLngs[latLngs.length - 1]
  const straightM = haversine(start, end)
  const ratio = straightM > 0 ? totalM / straightM : 0
  if (ratio >= RATIO_THRESHOLD) {
    flags.push({
      type: 'ratio_high',
      ratio: +ratio.toFixed(2),
      totalKm: +(totalM / 1000).toFixed(2),
      straightKm: +(straightM / 1000).toFixed(2),
    })
  }

  // Optional OSRM drift
  if (useOsrm) {
    const wps = []
    if (jeep.terminalLat && jeep.terminalLng) wps.push([jeep.terminalLat, jeep.terminalLng])
    wps.push(end)
    const osrmM = await fetchOsrmLength(wps)
    if (osrmM != null) {
      const drift = (totalM - osrmM) / osrmM
      if (Math.abs(drift) >= OSRM_DRIFT_THRESHOLD) {
        flags.push({
          type: 'osrm_drift',
          driftPct: Math.round(drift * 100),
          storedKm: +(totalM / 1000).toFixed(2),
          osrmKm: +(osrmM / 1000).toFixed(2),
        })
      }
    }
    await new Promise((r) => setTimeout(r, 1100)) // be polite to public OSRM
  }

  // Score: weighted sum so worst routes float to the top.
  let score = 0
  for (const f of flags) {
    if (f.type === 'sharp_uturn') score += f.count * 8
    else if (f.type === 'long_jump') score += f.count * 12
    else if (f.type === 'self_intersection') score += f.count * 4
    else if (f.type === 'ratio_high') score += Math.min(40, (f.ratio - RATIO_THRESHOLD) * 10 + 10)
    else if (f.type === 'osrm_drift') score += Math.min(40, Math.abs(f.driftPct) / 2)
    else if (f.type === 'no_polyline') score += 50
  }

  return {
    id: jeep.id,
    name: jeep.jeepName || jeep.routeName || '(unnamed)',
    terminal: jeep.terminalLocation,
    endPoint: jeep.endPoint,
    polylinePoints: latLngs.length,
    totalKm: +(totalM / 1000).toFixed(2),
    flags,
    score: Math.round(score),
  }
}

const main = async () => {
  console.log('[audit] Fetching jeepneys collection…')
  const snap = await getDocs(collection(db, 'jeepneys'))
  console.log(`[audit] Got ${snap.size} jeepney docs`)
  if (useOsrm) console.log('[audit] OSRM drift check enabled (1 req/sec)')

  const reports = []
  for (const doc of snap.docs) {
    const jeep = { id: doc.id, ...doc.data() }
    process.stdout.write(`  · ${jeep.jeepName || jeep.routeName || jeep.id}… `)
    const r = await auditOne(jeep)
    process.stdout.write(`flags=${r.flags.length} score=${r.score}\n`)
    reports.push(r)
  }

  reports.sort((a, b) => b.score - a.score)

  console.log('\n=== AUDIT REPORT (worst first) ===\n')
  for (const r of reports) {
    if (r.flags.length === 0) continue
    console.log(`[${r.score}] ${r.name}  (${r.polylinePoints} pts, ${r.totalKm} km)`)
    console.log(`    terminal: ${r.terminal || '?'}  →  ${r.endPoint || '?'}`)
    for (const f of r.flags) {
      console.log(`    • ${f.type}:`, JSON.stringify(f).slice(0, 160))
    }
    console.log()
  }

  const cleanCount = reports.filter((r) => r.flags.length === 0).length
  console.log(`Clean routes (no flags): ${cleanCount}/${reports.length}`)

  if (jsonOut) {
    writeFileSync(jsonOut, JSON.stringify(reports, null, 2))
    console.log(`Wrote ${reports.length} reports to ${jsonOut}`)
  }

  process.exit(0)
}

main().catch((err) => {
  console.error('[audit] Failed:', err)
  process.exit(1)
})
