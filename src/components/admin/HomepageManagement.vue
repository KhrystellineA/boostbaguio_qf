<template>
  <div role="region" aria-label="Homepage Management">
    <div class="row q-mb-md items-center">
      <div class="col">
        <h4 class="q-my-none text-pine-green">Homepage Management</h4>
        <p class="text-grey-7 q-mb-none">
          Manage homepage content: FAQs, Contacts, Photos, Partners, Footer links.
        </p>
      </div>
      <div class="col-auto">
        <q-btn
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
                  <div class="row items-center q-gutter-sm">
                    <q-btn
                      flat
                      dense
                      round
                      icon="edit"
                      color="primary"
                      @click="editFaq(props.row)"
                      :aria-label="`Edit FAQ: ${props.row.question}`"
                    />
                    <q-btn
                      flat
                      dense
                      round
                      icon="delete"
                      color="negative"
                      @click="confirmDelete(props.row)"
                      :aria-label="`Delete FAQ: ${props.row.question}`"
                    />
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
                <q-td :props="props">
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
                <q-td :props="props">
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
                <q-td :props="props">
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
            <q-input v-model="form.icon" outlined label="Icon name" dense class="q-mb-md" />
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
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore'
import PhotosManagement from 'src/components/admin/homepage/PhotosManagement.vue'

export default {
  name: 'HomepageManagement',
  components: { PhotosManagement },

  setup() {
    const $q = useQuasar()

    // Tabs
    const activeTab = ref('faqs')

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
        const q = query(faqCollection, orderBy('order', 'asc'))
        const snap = await getDocs(q)
        faqs.value = snap.docs
          .filter((d) => !d.data().isDeleted)
          .map((d) => ({ id: d.id, ...d.data() }))
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
        const q = query(contactsCollection, orderBy('key', 'asc'))
        const snap = await getDocs(q)
        contacts.value = snap.docs
          .filter((d) => !d.data().isDeleted)
          .map((d) => ({ id: d.id, ...d.data() }))
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
        const q = query(partnersCollection, orderBy('order', 'asc'))
        const snap = await getDocs(q)
        partners.value = snap.docs
          .filter((d) => !d.data().isDeleted)
          .map((d) => ({ id: d.id, ...d.data() }))
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
        const q = query(footerCollection, orderBy('name', 'asc'))
        const snap = await getDocs(q)
        footerLinks.value = snap.docs
          .filter((d) => !d.data().isDeleted)
          .map((d) => ({ id: d.id, ...d.data() }))
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
      const term = search.value.trim().toLowerCase()
      if (!term) return faqs.value
      return faqs.value.filter(
        (f) =>
          (f.question || '').toLowerCase().includes(term) ||
          (f.answer || '').toLowerCase().includes(term)
      )
    })

    const filteredContacts = computed(() => {
      const t = contactSearch.value.trim().toLowerCase()
      if (!t) return contacts.value
      return contacts.value.filter(
        (c) => (c.key || '').toLowerCase().includes(t) || (c.value || '').toLowerCase().includes(t)
      )
    })

    const filteredPartners = computed(() => {
      const t = partnerSearch.value.trim().toLowerCase()
      if (!t) return partners.value
      return partners.value.filter((p) => (p.name || '').toLowerCase().includes(t))
    })

    const filteredFooterLinks = computed(() => {
      const t = footerSearch.value.trim().toLowerCase()
      if (!t) return footerLinks.value
      return footerLinks.value.filter(
        (f) => (f.name || '').toLowerCase().includes(t) || (f.url || '').toLowerCase().includes(t)
      )
    })

    // --- Actions: open, edit, save, delete ---
    const resetForm = () => {
      editingItem.value = null
      form.value = {}
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
        title: 'Delete FAQ',
        message: `Delete "${faq.question}"? This cannot be undone.`,
        cancel: true,
        persistent: true,
      }).onOk(() => deleteFaq(faq))
    }
    const deleteFaq = async (faq) => {
      try {
        await deleteDoc(doc(db, 'faqs', faq.id))
        $q.notify({ type: 'positive', message: 'FAQ deleted' })
        await loadFaqs()
      } catch (e) {
        console.error(e)
        $q.notify({ type: 'negative', message: 'Failed to delete FAQ' })
      }
    }

    const confirmDeleteContact = (c) => {
      $q.dialog({
        title: 'Delete Contact',
        message: `Delete "${c.key}"?`,
        cancel: true,
        persistent: true,
      }).onOk(() => deleteContact(c))
    }
    const deleteContact = async (c) => {
      try {
        await deleteDoc(doc(db, 'homepage_contacts', c.id))
        $q.notify({ type: 'positive', message: 'Contact deleted' })
        await loadContacts()
      } catch (e) {
        console.error(e)
        $q.notify({ type: 'negative', message: 'Failed to delete contact' })
      }
    }

    const confirmDeletePartner = (p) => {
      $q.dialog({
        title: 'Delete Partner',
        message: `Delete "${p.name}"?`,
        cancel: true,
        persistent: true,
      }).onOk(() => deletePartner(p))
    }
    const deletePartner = async (p) => {
      try {
        await deleteDoc(doc(db, 'partners', p.id))
        $q.notify({ type: 'positive', message: 'Partner deleted' })
        await loadPartners()
      } catch (e) {
        console.error(e)
        $q.notify({ type: 'negative', message: 'Failed to delete partner' })
      }
    }

    const confirmDeleteFooter = (f) => {
      $q.dialog({
        title: 'Delete Footer Link',
        message: `Delete "${f.name}"?`,
        cancel: true,
        persistent: true,
      }).onOk(() => deleteFooter(f))
    }
    const deleteFooter = async (f) => {
      try {
        await deleteDoc(doc(db, 'footer_links', f.id))
        $q.notify({ type: 'positive', message: 'Footer link deleted' })
        await loadFooter()
      } catch (e) {
        console.error(e)
        $q.notify({ type: 'negative', message: 'Failed to delete footer link' })
      }
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

      openAddDialog,
      editFaq,
      editContact,
      editPartner,
      editFooterLink,
      closeDialog,
      saveItem,
      confirmDelete,
      confirmDeleteContact,
      confirmDeletePartner,
      confirmDeleteFooter,
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
