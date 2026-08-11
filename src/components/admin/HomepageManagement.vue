<template>
  <div role="region" aria-label="Homepage Management">
    <div class="row q-mb-md items-center q-col-gutter-y-sm">
      <div class="col-12 col-sm">
        <h4 class="q-my-none text-pine-green">Homepage Management</h4>
        <p class="text-grey-7 q-mb-none">
          Manage homepage content: FAQs, Contacts, Photos, Partners, Footer links.
        </p>
      </div>
      <div class="col-12 col-sm-auto q-gutter-sm">
        <q-btn-group outline class="bg-white">
          <q-btn
            :color="viewMode === 'active' ? 'primary' : 'white'"
            :text-color="viewMode === 'active' ? 'white' : 'primary'"
            label="Active"
            @click="viewMode = 'active'"
            no-caps
          />
          <q-btn
            :color="viewMode === 'deleted' ? 'negative' : 'white'"
            :text-color="viewMode === 'deleted' ? 'white' : 'negative'"
            label="Recently Deleted"
            @click="viewMode = 'deleted'"
            no-caps
          />
        </q-btn-group>
        <q-btn
          v-if="viewMode === 'active'"
          unelevated
          color="primary"
          icon="add"
          label="Add"
          @click="openAddDialog"
          aria-label="Add new item"
        />
      </div>
    </div>

    <q-tabs v-model="activeTab" class="text-pine-green" align="left" dense>
      <q-tab name="partners" label="Partners" icon="handshake" />
      <q-tab name="photos" label="Photos" icon="photo_library" />
      <q-tab name="faqs" label="FAQs" icon="help" />
      <q-tab name="contacts" label="Contact Cards" icon="contact_mail" />
      <q-tab name="footer" label="Footer Links" icon="link" />
    </q-tabs>

    <div class="q-mt-md">
      <div v-if="activeTab === 'faqs'">
        <q-card>
          <q-card-section>
            <q-input
              v-model="search"
              outlined
              dense
              clearable
              placeholder="Search FAQs..."
              class="q-mb-md"
              aria-label="Search FAQs"
            >
              <template #prepend>
                <q-icon name="search" aria-hidden="true" />
              </template>
            </q-input>

            <q-table
              :rows="filteredFaqs"
              :columns="faqColumns"
              row-key="id"
              :loading="loadingFaqs"
              flat
              bordered
              flat-separator
              aria-label="FAQ management table"
            >
              <template #body-cell-answer="props">
                <q-td :props="props">
                  <div class="faq-answer-preview">{{ truncate(props.value, 120) }}</div>
                </q-td>
              </template>

              <template #body-cell-actions="props">
                <q-td :props="props">
                  <div class="row items-center q-gutter-sm justify-end">
                    <template v-if="viewMode === 'active'">
                      <q-btn
                        flat
                        dense
                        round
                        icon="edit"
                        color="primary"
                        @click="editFaq(props.row)"
                      />
                      <q-btn
                        flat
                        dense
                        round
                        icon="delete"
                        color="negative"
                        @click="confirmDelete(props.row)"
                      />
                    </template>
                    <template v-else>
                      <q-btn
                        flat
                        dense
                        round
                        icon="restore"
                        color="positive"
                        @click="restoreFaq(props.row)"
                      />
                      <q-btn
                        flat
                        dense
                        round
                        icon="delete_forever"
                        color="negative"
                        @click="confirmPermanentDeleteFaq(props.row)"
                      />
                    </template>
                  </div>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <div v-else-if="activeTab === 'contacts'">
        <q-card>
          <q-card-section>
            <q-input
              v-model="contactSearch"
              outlined
              dense
              clearable
              placeholder="Search contacts..."
              class="q-mb-md"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>

            <q-table
              :rows="filteredContacts"
              :columns="contactColumns"
              row-key="id"
              :loading="loadingContacts"
            >
              <template #body-cell-value="props">
                <q-td :props="props">{{ props.value }}</q-td>
              </template>
              <template #body-cell-actions="props">
                <q-td :props="props" align="right">
                  <template v-if="viewMode === 'active'">
                    <q-btn
                      flat
                      dense
                      round
                      icon="edit"
                      color="primary"
                      @click="editContact(props.row)"
                    />
                    <q-btn
                      flat
                      dense
                      round
                      icon="delete"
                      color="negative"
                      @click="confirmDeleteContact(props.row)"
                    />
                  </template>
                  <template v-else>
                    <q-btn
                      flat
                      dense
                      round
                      icon="restore"
                      color="positive"
                      @click="restoreContact(props.row)"
                    />
                    <q-btn
                      flat
                      dense
                      round
                      icon="delete_forever"
                      color="negative"
                      @click="confirmPermanentDeleteContact(props.row)"
                    />
                  </template>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <div v-else-if="activeTab === 'photos'">
        <PhotosManagement />
      </div>

      <div v-else-if="activeTab === 'partners'">
        <q-card>
          <q-card-section>
            <q-input
              v-model="partnerSearch"
              outlined
              dense
              clearable
              placeholder="Search partners..."
              class="q-mb-md"
            >
              <template #prepend><q-icon name="search" /></template>
            </q-input>

            <q-table
              :rows="filteredPartners"
              :columns="partnerColumns"
              row-key="id"
              :loading="loadingPartners"
            >
              <template #body-cell-name="props"
                ><q-td :props="props">{{ props.value }}</q-td></template
              >
              <template #body-cell-actions="props">
                <q-td :props="props" align="right">
                  <template v-if="viewMode === 'active'">
                    <q-btn
                      flat
                      dense
                      round
                      icon="edit"
                      color="primary"
                      @click="editPartner(props.row)"
                    />
                    <q-btn
                      flat
                      dense
                      round
                      icon="delete"
                      color="negative"
                      @click="confirmDeletePartner(props.row)"
                    />
                  </template>
                  <template v-else>
                    <q-btn
                      flat
                      dense
                      round
                      icon="restore"
                      color="positive"
                      @click="restorePartner(props.row)"
                    />
                    <q-btn
                      flat
                      dense
                      round
                      icon="delete_forever"
                      color="negative"
                      @click="confirmPermanentDeletePartner(props.row)"
                    />
                  </template>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <div v-else-if="activeTab === 'footer'">
        <q-card>
          <q-card-section>
            <q-input
              v-model="footerSearch"
              outlined
              dense
              clearable
              placeholder="Search footer links..."
              class="q-mb-md"
            >
              <template #prepend><q-icon name="search" /></template>
            </q-input>

            <q-table
              :rows="filteredFooterLinks"
              :columns="footerColumns"
              row-key="id"
              :loading="loadingFooter"
            >
              <template #body-cell-url="props"
                ><q-td :props="props"
                  ><a :href="props.value" target="_blank">{{ props.value }}</a></q-td
                ></template
              >
              <template #body-cell-actions="props">
                <q-td :props="props" align="right">
                  <template v-if="viewMode === 'active'">
                    <q-btn
                      flat
                      dense
                      round
                      icon="edit"
                      color="primary"
                      @click="editFooterLink(props.row)"
                    />
                    <q-btn
                      flat
                      dense
                      round
                      icon="delete"
                      color="negative"
                      @click="confirmDeleteFooter(props.row)"
                    />
                  </template>
                  <template v-else>
                    <q-btn
                      flat
                      dense
                      round
                      icon="restore"
                      color="positive"
                      @click="restoreFooterLink(props.row)"
                    />
                    <q-btn
                      flat
                      dense
                      round
                      icon="delete_forever"
                      color="negative"
                      @click="confirmPermanentDeleteFooter(props.row)"
                    />
                  </template>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Generic Dialog used for different sections -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 480px; max-width: 860px">
        <q-card-section>
          <div class="text-h6 text-pine-green">{{ dialogTitle }}</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-none">
          <div v-if="activeTab === 'faqs'">
            <q-input
              v-model="form.question"
              outlined
              label="Question"
              dense
              class="q-mb-md"
              :error="questionError"
              :error-message="questionError"
            />
            <q-input
              v-model="form.answer"
              outlined
              label="Answer"
              dense
              type="textarea"
              autogrow
              class="q-mb-md"
              :error="answerError"
              :error-message="answerError"
            />
            <q-input
              v-model.number="form.order"
              outlined
              label="Display order"
              dense
              type="number"
              min="0"
              step="1"
            />
          </div>

          <div v-else-if="activeTab === 'contacts'">
            <q-input
              v-model="form.key"
              outlined
              label="Label (Email, Phone, Office)"
              dense
              class="q-mb-md"
            />
            <q-input v-model="form.value" outlined label="Value" dense class="q-mb-md" />
            <q-input
              v-model="form.description"
              outlined
              label="Description"
              dense
              class="q-mb-md"
            />
          </div>

          <div v-else-if="activeTab === 'partners'">
            <q-input v-model="form.name" outlined label="Name" dense class="q-mb-md" />
            <q-file
              v-model="partnerIconFile"
              outlined
              dense
              label="Upload Icon Image"
              class="q-mb-md"
              accept="image/*"
              clearable
              :loading="isUploadingIcon"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>
            <div v-if="form.icon && !partnerIconFile" class="q-mb-md">
              <div class="text-caption q-mb-xs">Current Icon:</div>
              <q-img
                :src="form.icon"
                style="height: 50px; max-width: 50px; object-fit: contain"
                v-if="form.icon.startsWith('http')"
              />
              <q-icon :name="form.icon" size="32px" v-else />
            </div>
            <q-input v-model="form.link" outlined label="Link (optional)" dense class="q-mb-md" />
            <q-input v-model.number="form.order" outlined label="Order" dense type="number" />
          </div>

          <div v-else-if="activeTab === 'footer'">
            <q-input
              v-model="form.name"
              outlined
              label="Name (Facebook / Instagram)"
              dense
              class="q-mb-md"
            />
            <q-input v-model="form.url" outlined label="URL" dense class="q-mb-md" />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closeDialog" />
          <q-btn unelevated color="primary" label="Save" @click="saveItem" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { db } from 'src/boot/firebase'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import PhotosManagement from 'src/components/admin/homepage/PhotosManagement.vue'

export default {
  name: 'HomepageManagement',
  components: { PhotosManagement },

  setup() {
    const $q = useQuasar()

    // Tabs
    const activeTab = ref('faqs')
    const viewMode = ref('active')

    const partnerIconFile = ref(null)
    const isUploadingIcon = ref(false)

    // Generic dialog
    const showDialog = ref(false)
    const editingItem = ref(null)
    const dialogTitle = computed(() => {
      const nice = {
        faqs: 'FAQ',
        contacts: 'Contact Card',
        partners: 'Partner',
        footer: 'Footer Link',
      }
      const action = editingItem.value ? 'Edit' : 'Add'
      return `${action} ${nice[activeTab.value] || 'Item'}`
    })

    // --- FAQs ---
    const faqs = ref([])
    const loadingFaqs = ref(false)
    const search = ref('')
    const faqColumns = [
      { name: 'question', label: 'Question', field: 'question', sortable: true },
      { name: 'answer', label: 'Answer', field: 'answer' },
      { name: 'order', label: 'Order', field: 'order', align: 'center' },
      { name: 'actions', label: 'Actions', field: 'actions', align: 'right' },
    ]
    const faqCollection = collection(db, 'faqs')

    const loadFaqs = async () => {
      loadingFaqs.value = true
      try {
        let snap = await getDocs(query(faqCollection, orderBy('order', 'asc')))
        if (snap.empty) {
          const defaultFaqs = [
            {
              question: 'What is Boost Baguio?',
              answer:
                'Boost Baguio is a web app designed to enhance your commuting experience in Baguio City. It provides real-time jeepney navigation, route information, and curated tourist spots. Our goal is to promote sustainable tourism while making travel easier for everyone.',
              order: 0,
            },
            {
              question: 'How does navigation work?',
              answer:
                'Users can input their start and end points either manually or via GPS. The app then generates step-by-step directions for jeepney routes and terminal information. This feature ensures you never miss a ride!',
              order: 1,
            },
            {
              question: 'Are routes updated regularly?',
              answer:
                'Yes, our routes are constantly updated based on user feedback and crowdsourced data. We also include "Last Verified" timestamps to ensure accuracy. You can report any inaccuracies directly through the app.',
              order: 2,
            },
            {
              question: 'What are the fees?',
              answer:
                'Fares for jeepney rides vary depending on the route. The app provides fare information for each route to help you budget your travel. Keep an eye on updates for any changes in fares.',
              order: 3,
            },
            {
              question: 'Can I find events?',
              answer:
                'Absolutely! Our Events section aggregates local festivals and concerts happening in Baguio. You’ll also find transportation tips for getting to and from these events. Stay connected with the vibrant culture of Baguio!',
              order: 4,
            },
            {
              question: 'How to use "Near Me"?',
              answer:
                '"Near Me" utilizes your geolocation to suggest nearby attractions and jeepney routes. You can read reviews from the "Sa Baguio" Facebook group for additional insights. It’s a great way to discover hidden gems!',
              order: 5,
            },
            {
              question: 'Is the app free?',
              answer:
                'Yes, Boost Baguio is completely free to use. We aim to make commuting accessible to everyone in Baguio City. Enjoy all features without any hidden costs!',
              order: 6,
            },
            {
              question: 'How can I contact support?',
              answer:
                'For support, you can reach out through the Contact section of the app. We’re here to assist you with any questions or concerns. Your feedback helps us improve our service!',
              order: 7,
            },
            {
              question: 'What if I have suggestions?',
              answer:
                'We welcome your suggestions! You can submit them directly through the app or via our website. Your input is invaluable in helping us enhance the user experience.',
              order: 8,
            },
            {
              question: 'Is the app safe?',
              answer:
                'Yes, we prioritize user safety and data privacy. The app is designed with secure protocols to protect your information. Travel with peace of mind while using Boost Baguio.',
              order: 9,
            },
          ]
          for (const item of defaultFaqs) {
            await addDoc(faqCollection, item)
          }
          snap = await getDocs(query(faqCollection, orderBy('order', 'asc')))
        }
        faqs.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      } catch (e) {
        console.error('[HomepageManagement] loadFaqs', e)
        $q.notify({ type: 'negative', message: 'Failed to load FAQs' })
      } finally {
        loadingFaqs.value = false
      }
    }

    // --- Contacts ---
    const contacts = ref([])
    const loadingContacts = ref(false)
    const contactSearch = ref('')
    const contactColumns = [
      { name: 'key', label: 'Label', field: 'key' },
      { name: 'value', label: 'Value', field: 'value' },
      { name: 'description', label: 'Description', field: 'description' },
      { name: 'actions', label: 'Actions', field: 'actions', align: 'right' },
    ]
    const contactsCollection = collection(db, 'homepage_contacts')

    const loadContacts = async () => {
      loadingContacts.value = true
      try {
        let snap = await getDocs(collection(db, 'homepage_contacts'))
        if (snap.empty) {
          const defaultContacts = [
            {
              key: 'Email',
              value: 'contact@boostbaguio.com',
              description: "We'd love to hear from you! Share your thoughts or questions.",
              icon: 'email',
            },
            {
              key: 'Phone',
              value: '(+63) coming soon',
              description: 'Reach us anytime for assistance or inquiries.',
              icon: 'phone',
            },
            {
              key: 'Office',
              value: 'Baguio City, PH',
              description: 'Visit us for support or collaboration opportunities.',
              icon: 'location_on',
            },
          ]
          for (const item of defaultContacts) {
            await addDoc(collection(db, 'homepage_contacts'), item)
          }
          snap = await getDocs(collection(db, 'homepage_contacts'))
        }
        contacts.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      } catch (e) {
        console.error('[HomepageManagement] loadContacts', e)
        $q.notify({ type: 'negative', message: 'Failed to load contacts' })
      } finally {
        loadingContacts.value = false
      }
    }

    // --- Partners ---
    const partners = ref([])
    const loadingPartners = ref(false)
    const partnerSearch = ref('')
    const partnerColumns = [
      { name: 'name', label: 'Name', field: 'name' },
      { name: 'icon', label: 'Icon', field: 'icon' },
      { name: 'link', label: 'Link', field: 'link' },
      { name: 'actions', label: 'Actions', field: 'actions', align: 'right' },
    ]
    const partnersCollection = collection(db, 'partners')

    const loadPartners = async () => {
      loadingPartners.value = true
      try {
        let snap = await getDocs(query(collection(db, 'partners'), orderBy('order', 'asc')))
        if (snap.empty) {
          const defaultPartners = [
            { name: 'Baguio City Tourism', icon: 'business', color: 'primary', order: 0 },
            { name: 'LTFRB Cordillera', icon: 'directions_bus', color: 'secondary', order: 1 },
            { name: 'DOT Philippines', icon: 'travel_explore', color: 'accent', order: 2 },
            { name: 'Baguio Local Gov', icon: 'account_balance', color: 'positive', order: 3 },
          ]
          for (const item of defaultPartners) {
            await addDoc(collection(db, 'partners'), item)
          }
          snap = await getDocs(query(collection(db, 'partners'), orderBy('order', 'asc')))
        }
        partners.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      } catch (e) {
        console.error('[HomepageManagement] loadPartners', e)
        $q.notify({ type: 'negative', message: 'Failed to load partners' })
      } finally {
        loadingPartners.value = false
      }
    }

    // --- Footer Links ---
    const footerLinks = ref([])
    const loadingFooter = ref(false)
    const footerSearch = ref('')
    const footerColumns = [
      { name: 'name', label: 'Name', field: 'name' },
      { name: 'url', label: 'URL', field: 'url' },
      { name: 'actions', label: 'Actions', field: 'actions', align: 'right' },
    ]
    const footerCollection = collection(db, 'footer_links')

    const loadFooter = async () => {
      loadingFooter.value = true
      try {
        let snap = await getDocs(collection(db, 'footer_links'))
        if (snap.empty) {
          const defaultFooterLinks = [
            { name: 'Facebook', url: 'https://facebook.com', icon: 'facebook' },
            { name: 'Instagram', url: 'https://instagram.com', icon: 'photo_camera' },
          ]
          for (const item of defaultFooterLinks) {
            await addDoc(collection(db, 'footer_links'), item)
          }
          snap = await getDocs(collection(db, 'footer_links'))
        }
        footerLinks.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      } catch (e) {
        console.error('[HomepageManagement] loadFooter', e)
        $q.notify({ type: 'negative', message: 'Failed to load footer links' })
      } finally {
        loadingFooter.value = false
      }
    }

    // Generic form
    const form = ref({})
    const questionError = ref('')
    const answerError = ref('')

    // Filters
    const filteredFaqs = computed(() => {
      let f = faqs.value.filter((d) => (viewMode.value === 'active' ? !d.isDeleted : d.isDeleted))
      if (!search.value) return f
      const s = search.value.toLowerCase()
      return f.filter(
        (i) => i.question?.toLowerCase().includes(s) || i.answer?.toLowerCase().includes(s)
      )
    })

    const filteredContacts = computed(() => {
      let c = contacts.value.filter((d) =>
        viewMode.value === 'active' ? !d.isDeleted : d.isDeleted
      )
      const t = contactSearch.value.trim().toLowerCase()
      if (!t) return c
      return c.filter(
        (i) => (i.key || '').toLowerCase().includes(t) || (i.value || '').toLowerCase().includes(t)
      )
    })

    const filteredPartners = computed(() => {
      let p = partners.value.filter((d) =>
        viewMode.value === 'active' ? !d.isDeleted : d.isDeleted
      )
      if (!partnerSearch.value) return p
      const s = partnerSearch.value.toLowerCase()
      return p.filter((i) => i.name?.toLowerCase().includes(s))
    })

    const filteredFooterLinks = computed(() => {
      let f = footerLinks.value.filter((d) =>
        viewMode.value === 'active' ? !d.isDeleted : d.isDeleted
      )
      const t = footerSearch.value.trim().toLowerCase()
      if (!t) return f
      return f.filter(
        (i) => (i.name || '').toLowerCase().includes(t) || (i.url || '').toLowerCase().includes(t)
      )
    })

    // --- Actions: open, edit, save, delete ---
    const resetForm = () => {
      editingItem.value = null
      form.value = {}
      partnerIconFile.value = null
      questionError.value = ''
      answerError.value = ''
    }

    const openAddDialog = () => {
      resetForm()
      // prefill order for faqs/partners
      if (activeTab.value === 'faqs') form.value.order = faqs.value.length
      if (activeTab.value === 'partners') form.value.order = partners.value.length
      showDialog.value = true
    }

    // Edit handlers
    const editFaq = (f) => {
      activeTab.value = 'faqs'
      editingItem.value = f
      form.value = { question: f.question || '', answer: f.answer || '', order: f.order ?? 0 }
      showDialog.value = true
    }

    const editContact = (c) => {
      activeTab.value = 'contacts'
      editingItem.value = c
      form.value = { key: c.key || '', value: c.value || '', description: c.description || '' }
      showDialog.value = true
    }

    const editPartner = (p) => {
      activeTab.value = 'partners'
      editingItem.value = p
      partnerIconFile.value = null
      form.value = {
        name: p.name || '',
        icon: p.icon || '',
        link: p.link || '',
        order: p.order ?? 0,
      }
      showDialog.value = true
    }

    const editFooterLink = (f) => {
      activeTab.value = 'footer'
      editingItem.value = f
      form.value = { name: f.name || '', url: f.url || '' }
      showDialog.value = true
    }

    const closeDialog = () => {
      showDialog.value = false
      resetForm()
    }

    const validateFaqForm = () => {
      questionError.value = form.value.question?.trim() ? '' : 'Question is required.'
      answerError.value = form.value.answer?.trim() ? '' : 'Answer is required.'
      return !questionError.value && !answerError.value
    }

    const saveItem = async () => {
      try {
        if (activeTab.value === 'faqs') {
          if (!validateFaqForm()) return
          if (editingItem.value) {
            await updateDoc(doc(db, 'faqs', editingItem.value.id), {
              question: form.value.question.trim(),
              answer: form.value.answer.trim(),
              order: Number(form.value.order) || 0,
            })
            $q.notify({ type: 'positive', message: 'FAQ updated' })
          } else {
            await addDoc(faqCollection, {
              question: form.value.question.trim(),
              answer: form.value.answer.trim(),
              order: Number(form.value.order) || faqs.value.length,
            })
            $q.notify({ type: 'positive', message: 'FAQ added' })
          }
          await loadFaqs()
        } else if (activeTab.value === 'contacts') {
          if (editingItem.value) {
            await updateDoc(doc(db, 'homepage_contacts', editingItem.value.id), {
              key: form.value.key,
              value: form.value.value,
              description: form.value.description || '',
            })
            $q.notify({ type: 'positive', message: 'Contact updated' })
          } else {
            await addDoc(contactsCollection, {
              key: form.value.key,
              value: form.value.value,
              description: form.value.description || '',
            })
            $q.notify({ type: 'positive', message: 'Contact added' })
          }
          await loadContacts()
        } else if (activeTab.value === 'partners') {
          if (partnerIconFile.value) {
            isUploadingIcon.value = true
            try {
              const storage = getStorage()
              const iconRef = storageRef(
                storage,
                `partners/${Date.now()}_${partnerIconFile.value.name}`
              )
              await uploadBytes(iconRef, partnerIconFile.value)
              form.value.icon = await getDownloadURL(iconRef)
            } catch (err) {
              console.error('Error uploading partner icon:', err)
              $q.notify({ type: 'negative', message: 'Failed to upload icon' })
            } finally {
              isUploadingIcon.value = false
            }
          }

          if (editingItem.value) {
            await updateDoc(doc(db, 'partners', editingItem.value.id), {
              name: form.value.name,
              icon: form.value.icon || '',
              link: form.value.link || '',
              order: Number(form.value.order) || 0,
            })
            $q.notify({ type: 'positive', message: 'Partner updated' })
          } else {
            await addDoc(partnersCollection, {
              name: form.value.name,
              icon: form.value.icon || '',
              link: form.value.link || '',
              order: Number(form.value.order) || partners.value.length,
            })
            $q.notify({ type: 'positive', message: 'Partner added' })
          }
          await loadPartners()
        } else if (activeTab.value === 'footer') {
          if (editingItem.value) {
            await updateDoc(doc(db, 'footer_links', editingItem.value.id), {
              name: form.value.name,
              url: form.value.url,
            })
            $q.notify({ type: 'positive', message: 'Footer link updated' })
          } else {
            await addDoc(footerCollection, {
              name: form.value.name,
              url: form.value.url,
            })
            $q.notify({ type: 'positive', message: 'Footer link added' })
          }
          await loadFooter()
        }

        closeDialog()
      } catch (e) {
        console.error('[HomepageManagement] saveItem', e)
        $q.notify({ type: 'negative', message: 'Failed to save item' })
      }
    }

    // Delete handlers
    const confirmDelete = (faq) => {
      $q.dialog({
        title: 'Confirm',
        message: 'Are you sure you want to delete this FAQ?',
        cancel: true,
      }).onOk(async () => {
        await updateDoc(doc(db, 'faqs', faq.id), { isDeleted: true, deletedAt: serverTimestamp() })
        $q.notify({ type: 'positive', message: 'FAQ deleted' })
        loadFaqs()
      })
    }
    const restoreFaq = async (faq) => {
      await updateDoc(doc(db, 'faqs', faq.id), { isDeleted: false })
      $q.notify({ type: 'positive', message: 'FAQ restored' })
      loadFaqs()
    }
    const confirmPermanentDeleteFaq = (faq) => {
      $q.dialog({
        title: 'Permanent Delete',
        message: 'Are you sure you want to permanently delete this FAQ?',
        cancel: true,
      }).onOk(async () => {
        await deleteDoc(doc(db, 'faqs', faq.id))
        $q.notify({ type: 'positive', message: 'FAQ permanently deleted' })
        loadFaqs()
      })
    }

    const confirmDeleteContact = (c) => {
      $q.dialog({
        title: 'Confirm',
        message: 'Delete this contact?',
        cancel: true,
      }).onOk(async () => {
        await updateDoc(doc(db, 'homepage_contacts', c.id), {
          isDeleted: true,
          deletedAt: serverTimestamp(),
        })
        $q.notify({ type: 'positive', message: 'Contact deleted' })
        loadContacts()
      })
    }
    const restoreContact = async (c) => {
      await updateDoc(doc(db, 'homepage_contacts', c.id), { isDeleted: false })
      $q.notify({ type: 'positive', message: 'Contact restored' })
      loadContacts()
    }
    const confirmPermanentDeleteContact = (c) => {
      $q.dialog({
        title: 'Permanent Delete',
        message: 'Permanently delete this contact?',
        cancel: true,
      }).onOk(async () => {
        await deleteDoc(doc(db, 'homepage_contacts', c.id))
        $q.notify({ type: 'positive', message: 'Contact permanently deleted' })
        loadContacts()
      })
    }

    const confirmDeletePartner = (p) => {
      $q.dialog({
        title: 'Confirm',
        message: 'Delete this partner?',
        cancel: true,
      }).onOk(async () => {
        await updateDoc(doc(db, 'partners', p.id), {
          isDeleted: true,
          deletedAt: serverTimestamp(),
        })
        $q.notify({ type: 'positive', message: 'Partner deleted' })
        loadPartners()
      })
    }
    const restorePartner = async (p) => {
      await updateDoc(doc(db, 'partners', p.id), { isDeleted: false })
      $q.notify({ type: 'positive', message: 'Partner restored' })
      loadPartners()
    }
    const confirmPermanentDeletePartner = (p) => {
      $q.dialog({
        title: 'Permanent Delete',
        message: 'Permanently delete this partner?',
        cancel: true,
      }).onOk(async () => {
        await deleteDoc(doc(db, 'partners', p.id))
        $q.notify({ type: 'positive', message: 'Partner permanently deleted' })
        loadPartners()
      })
    }

    const confirmDeleteFooter = (f) => {
      $q.dialog({
        title: 'Confirm',
        message: 'Delete this footer link?',
        cancel: true,
      }).onOk(async () => {
        await updateDoc(doc(db, 'footer_links', f.id), {
          isDeleted: true,
          deletedAt: serverTimestamp(),
        })
        $q.notify({ type: 'positive', message: 'Link deleted' })
        loadFooter()
      })
    }
    const restoreFooterLink = async (f) => {
      await updateDoc(doc(db, 'footer_links', f.id), { isDeleted: false })
      $q.notify({ type: 'positive', message: 'Link restored' })
      loadFooter()
    }
    const confirmPermanentDeleteFooter = (f) => {
      $q.dialog({
        title: 'Permanent Delete',
        message: 'Permanently delete this footer link?',
        cancel: true,
      }).onOk(async () => {
        await deleteDoc(doc(db, 'footer_links', f.id))
        $q.notify({ type: 'positive', message: 'Link permanently deleted' })
        loadFooter()
      })
    }

    onMounted(() => {
      loadFaqs()
      loadContacts()
      loadPartners()
      loadFooter()
    })

    return {
      activeTab,
      showDialog,
      dialogTitle,
      // faqs
      faqs,
      loadingFaqs,
      search,
      faqColumns,
      filteredFaqs,
      // contacts
      contacts,
      loadingContacts,
      contactSearch,
      contactColumns,
      filteredContacts,
      // partners
      partners,
      loadingPartners,
      partnerSearch,
      partnerColumns,
      partnerIconFile,
      isUploadingIcon,
      filteredPartners,
      // footer
      footerLinks,
      loadingFooter,
      footerSearch,
      footerColumns,
      filteredFooterLinks,

      // generic
      form,
      questionError,
      answerError,
      viewMode,

      openAddDialog,
      editFaq,
      editContact,
      editPartner,
      editFooterLink,
      closeDialog,
      saveItem,
      confirmDelete,
      restoreFaq,
      confirmPermanentDeleteFaq,
      confirmDeleteContact,
      restoreContact,
      confirmPermanentDeleteContact,
      confirmDeletePartner,
      restorePartner,
      confirmPermanentDeletePartner,
      confirmDeleteFooter,
      restoreFooterLink,
      confirmPermanentDeleteFooter,
      truncate: (t, n) => (t ? (t.length > n ? `${t.slice(0, n)}…` : t) : ''),
    }
  },
}
</script>

<style scoped>
.faq-answer-preview {
  color: #4a4a4a;
}
</style>
<!-- --rabbit --K -->
