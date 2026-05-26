/*
 Seed default homepage data into Firestore.
 Usage:
   Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON, then:
     node scripts/seed-homepage-data.cjs
   To force overwrite (delete existing docs):
     node scripts/seed-homepage-data.cjs --force

 This script uses firebase-admin and will run server-side. Review defaults before running.
*/

const admin = require('firebase-admin')

const force = process.argv.includes('--force')

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.FIREBASE_CONFIG) {
  console.warn('WARNING: GOOGLE_APPLICATION_CREDENTIALS not set. The script will try application default credentials.')
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
})

const db = admin.firestore()

const defaultFaqs = [
  {
    question: 'What is Boost Baguio?',
    answer:
      'Boost Baguio is a web app designed to enhance your commuting experience in Baguio City. It provides real-time jeepney navigation, route information, and curated tourist spots.',
    order: 0,
  },
  {
    question: 'How does navigation work?',
    answer:
      'Users can input their start and end points either manually or via GPS. The app then generates step-by-step directions for jeepney routes and terminal information.',
    order: 1,
  },
  {
    question: 'Are routes updated regularly?',
    answer: 'Yes — routes are updated based on user feedback and crowdsourced data.',
    order: 2,
  },
  {
    question: 'What are the fees?',
    answer: 'Fares vary by route; the app shows estimated fares for each route.',
    order: 3,
  },
]

const defaultContacts = [
  { key: 'Email', value: 'contact@boostbaguio.com', description: "We'd love to hear from you!", icon: 'email' },
  { key: 'Phone', value: '+639266321140', description: 'Reach us anytime for assistance or inquiries.', icon: 'phone' },
  { key: 'Office', value: 'Baguio City, PH', description: 'Visit us for support or collaboration opportunities.', icon: 'location_on' },
]

const defaultPartners = [
  { name: 'Baguio City Tourism', icon: 'business', order: 0 },
  { name: 'LTFRB Cordillera', icon: 'directions_bus', order: 1 },
  { name: 'DOT Philippines', icon: 'travel_explore', order: 2 },
]

const defaultFooter = [
  { name: 'Facebook', url: 'https://www.facebook.com/boostbaguio', icon: 'facebook' },
  { name: 'Instagram', url: 'https://www.instagram.com/boostbaguio', icon: 'photo_camera' },
]

const defaultPagePhotos = {
  home: {
    imageUrl: '/images/placeholder-image.png',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
}

async function seedCollectionIfEmpty(collectionName, defaults) {
  const collRef = db.collection(collectionName)
  const snap = await collRef.limit(1).get()
  if (!snap.empty && !force) {
    console.log(`Skipping ${collectionName} (already has documents). Use --force to overwrite.`)
    return
  }

  if (force) {
    console.log(`Clearing ${collectionName}...`)
    const existing = await collRef.get()
    const batch = db.batch()
    existing.docs.forEach((d) => batch.delete(d.ref))
    await batch.commit()
  }

  console.log(`Seeding ${collectionName} (${defaults.length} items)...`)
  for (const item of defaults) {
    await collRef.add(item)
  }
  console.log(`Seeded ${collectionName}`)
}

async function seed() {
  try {
    // FAQs
    await seedCollectionIfEmpty('faqs', defaultFaqs)

    // Contacts
    await seedCollectionIfEmpty('homepage_contacts', defaultContacts)

    // Partners
    await seedCollectionIfEmpty('partners', defaultPartners)

    // Footer links
    await seedCollectionIfEmpty('footer_links', defaultFooter)

    // Page photos (single doc 'home')
    const pagePhotosRef = db.collection('pagePhotos').doc('home')
    const docSnap = await pagePhotosRef.get()
    if (!docSnap.exists || force) {
      await pagePhotosRef.set(defaultPagePhotos.home)
      console.log('Seeded pagePhotos/home')
    } else {
      console.log('Skipping pagePhotos/home (exists).')
    }

    console.log('Seeding complete.')
    process.exit(0)
  } catch (e) {
    console.error('Seeding failed', e)
    process.exit(1)
  }
}

seed()
