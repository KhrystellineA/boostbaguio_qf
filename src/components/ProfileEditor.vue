<!--
  Maximized dialog for editing the current user's display name, avatar, and
  contact info. Writes to `users/{uid}` in Firestore.
  Used by: src/pages/AccountPage.vue.
-->
<template>
  <q-dialog v-model="dialogVisible" persistent maximized>
    <q-card class="profile-editor-card">
      <q-card-section class="row items-center bg-primary text-white">
        <div class="text-h6">Edit Profile</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-none">
        <q-tabs
          v-model="activeTab"
          dense
          class="bg-grey-2"
          active-color="primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab name="profile" icon="person" label="Profile Info" />
          <q-tab name="password" icon="lock" label="Change Password" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="activeTab" animated>
          <!-- Profile Info Tab -->
          <q-tab-panel name="profile">
            <div class="row justify-center q-pa-lg">
              <div class="col-12 col-md-8 col-lg-6">
                <!-- Profile Picture Section -->
                <div class="text-center q-mb-xl">
                  <q-avatar size="150px" class="shadow-3 cursor-pointer" @click="triggerFileInput">
                    <img
                      v-if="profileForm.photoURL || userPhotoURL"
                      :src="profileForm.photoURL || userPhotoURL"
                      alt="Profile Picture"
                      @error="handleImageError"
                    />
                    <q-icon v-else name="photo_camera" size="60px" color="grey-6" />

                    <q-badge color="primary" floating rounded>
                      <q-icon name="edit" size="xs" />
                    </q-badge>
                  </q-avatar>

                  <div class="q-mt-md">
                    <q-btn
                      flat
                      label="Change Photo"
                      icon="upload"
                      color="primary"
                      @click="triggerFileInput"
                    />
                    <q-btn
                      v-if="profileForm.photoURL || userPhotoURL"
                      flat
                      label="Remove"
                      icon="delete"
                      color="negative"
                      class="q-ml-sm"
                      @click="removePhoto"
                    />
                  </div>

                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    style="display: none"
                    @change="handleFileSelect"
                  />

                  <div v-if="uploadingImage" class="q-mt-md">
                    <q-spinner-hourglass color="primary" size="24px" />
                    <span class="q-ml-sm text-grey-7">Uploading...</span>
                  </div>
                </div>

                <!-- Profile Form -->
                <q-form @submit="saveProfileInfo" class="q-gutter-md">
                  <q-input
                    v-model="profileForm.displayName"
                    label="Display Name"
                    outlined
                    dense
                    :rules="[(val) => !!val || 'Name is required']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person" />
                    </template>
                  </q-input>

                  <q-input
                    v-model="profileForm.email"
                    label="Email"
                    outlined
                    dense
                    readonly
                    disabled
                  >
                    <template v-slot:prepend>
                      <q-icon name="email" />
                    </template>
                  </q-input>

                  <div class="row q-col-gutter-sm q-mt-lg">
                    <div class="col-6">
                      <q-btn
                        label="Cancel"
                        color="grey"
                        outline
                        class="full-width"
                        @click="closeDialog"
                      />
                    </div>
                    <div class="col-6">
                      <q-btn
                        label="Save Changes"
                        type="submit"
                        color="primary"
                        class="full-width"
                        :loading="savingProfile"
                      />
                    </div>
                  </div>
                </q-form>
              </div>
            </div>
          </q-tab-panel>

          <!-- Password Tab -->
          <q-tab-panel name="password">
            <div class="row justify-center q-pa-lg">
              <div class="col-12 col-md-8 col-lg-6">
                <q-form @submit="savePassword" class="q-gutter-md q-mt-md">
                  <q-input
                    v-model="passwordForm.currentPassword"
                    label="Current Password"
                    type="password"
                    outlined
                    dense
                    :rules="[(val) => !!val || 'Current password is required']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="lock" />
                    </template>
                  </q-input>

                  <q-input
                    v-model="passwordForm.newPassword"
                    label="New Password"
                    type="password"
                    outlined
                    dense
                    :rules="[
                      (val) => !!val || 'New password is required',
                      (val) => val.length >= 6 || 'Password must be at least 6 characters',
                    ]"
                  >
                    <template v-slot:prepend>
                      <q-icon name="lock_reset" />
                    </template>
                  </q-input>

                  <q-input
                    v-model="passwordForm.confirmPassword"
                    label="Confirm New Password"
                    type="password"
                    outlined
                    dense
                    :rules="[
                      (val) => !!val || 'Please confirm your new password',
                      (val) => val === passwordForm.newPassword || 'Passwords do not match',
                    ]"
                  >
                    <template v-slot:prepend>
                      <q-icon name="lock_outline" />
                    </template>
                  </q-input>

                  <q-banner v-if="passwordForm.newPassword" class="bg-grey-2 q-mt-md" rounded>
                    <template v-slot:avatar>
                      <q-icon name="info" color="primary" />
                    </template>
                    Password requirements:
                    <ul>
                      <li>At least 6 characters long</li>
                      <li>Use a mix of letters, numbers, and symbols</li>
                      <li>Avoid using personal information</li>
                    </ul>
                  </q-banner>

                  <div class="row q-col-gutter-sm q-mt-lg">
                    <div class="col-6">
                      <q-btn
                        label="Cancel"
                        color="grey"
                        outline
                        class="full-width"
                        @click="closeDialog"
                      />
                    </div>
                    <div class="col-6">
                      <q-btn
                        label="Change Password"
                        type="submit"
                        color="primary"
                        class="full-width"
                        :loading="savingPassword"
                      />
                    </div>
                  </div>
                </q-form>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, computed, watch } from 'vue'
import { useUserStore } from 'src/stores/user-store'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { Notify } from 'quasar'

export default defineComponent({
  name: 'ProfileEditor',

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const userStore = useUserStore()
    const storage = getStorage()

    const activeTab = ref('profile')
    const fileInput = ref(null)
    const selectedFile = ref(null)
    const uploadingImage = ref(false)
    const savingProfile = ref(false)
    const savingPassword = ref(false)

    const profileForm = ref({
      displayName: '',
      email: '',
      photoURL: '',
    })

    const passwordForm = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })

    const dialogVisible = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    })

    const userPhotoURL = computed(() => userStore.user?.photoURL || '')

    watch(
      () => props.modelValue,
      (newVal) => {
        if (newVal) {
          initializeForm()
        }
      },
      { immediate: true }
    )

    function initializeForm() {
      profileForm.value = {
        displayName: userStore.user?.displayName || '',
        email: userStore.user?.email || '',
        photoURL: userStore.user?.photoURL || '',
      }

      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }

      selectedFile.value = null
      activeTab.value = 'profile'
    }

    function triggerFileInput() {
      fileInput.value?.click()
    }

    function handleFileSelect(event) {
      const file = event.target.files[0]
      if (!file) return

      if (file.size > 5 * 1024 * 1024) {
        Notify.create({
          type: 'warning',
          message: 'File size must be less than 5MB',
          position: 'top',
        })
        return
      }

      if (!file.type.startsWith('image/')) {
        Notify.create({
          type: 'warning',
          message: 'Please select an image file',
          position: 'top',
        })
        return
      }

      selectedFile.value = file

      const reader = new FileReader()
      reader.onload = (e) => {
        profileForm.value.photoURL = e.target.result
      }
      reader.readAsDataURL(file)
    }

    function handleImageError() {
      profileForm.value.photoURL = ''
    }

    function removePhoto() {
      profileForm.value.photoURL = ''
      selectedFile.value = null
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }

    async function uploadImage(file) {
      if (!userStore.user) return null

      try {
        uploadingImage.value = true
        const timestamp = Date.now()
        const fileName = `${userStore.user.uid}_profile_${timestamp}`
        const imageRef = storageRef(storage, `profile-pictures/${fileName}`)

        await uploadBytes(imageRef, file)
        const downloadURL = await getDownloadURL(imageRef)

        return downloadURL
      } catch (error) {
        console.error('[ProfileEditor] Image upload error:', error)
        Notify.create({
          type: 'negative',
          message: 'Failed to upload image',
          position: 'top',
        })
        return null
      } finally {
        uploadingImage.value = false
      }
    }

    async function saveProfileInfo() {
      if (!profileForm.value.displayName.trim()) {
        Notify.create({
          type: 'warning',
          message: 'Display name is required',
          position: 'top',
        })
        return
      }

      savingProfile.value = true

      try {
        let photoURL = profileForm.value.photoURL

        if (selectedFile.value) {
          const uploadedURL = await uploadImage(selectedFile.value)
          if (uploadedURL) {
            photoURL = uploadedURL
          } else {
            savingProfile.value = false
            return
          }
        }

        const result = await userStore.updateProfileInfo({
          displayName: profileForm.value.displayName.trim(),
          photoURL: photoURL || null,
        })

        if (result.success) {
          closeDialog()
        }
      } catch (error) {
        console.error('[ProfileEditor] Save profile error:', error)
      } finally {
        savingProfile.value = false
      }
    }

    async function savePassword() {
      if (!passwordForm.value.currentPassword) {
        Notify.create({
          type: 'warning',
          message: 'Current password is required',
          position: 'top',
        })
        return
      }

      if (!passwordForm.value.newPassword) {
        Notify.create({
          type: 'warning',
          message: 'New password is required',
          position: 'top',
        })
        return
      }

      if (passwordForm.value.newPassword.length < 6) {
        Notify.create({
          type: 'warning',
          message: 'New password must be at least 6 characters',
          position: 'top',
        })
        return
      }

      if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        Notify.create({
          type: 'warning',
          message: 'Passwords do not match',
          position: 'top',
        })
        return
      }

      savingPassword.value = true

      try {
        const result = await userStore.updatePassword({
          currentPassword: passwordForm.value.currentPassword,
          newPassword: passwordForm.value.newPassword,
        })

        if (result.success) {
          passwordForm.value = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          }
          closeDialog()
        }
      } catch (error) {
        console.error('[ProfileEditor] Save password error:', error)
      } finally {
        savingPassword.value = false
      }
    }

    function closeDialog() {
      emit('update:modelValue', false)
    }

    return {
      dialogVisible,
      activeTab,
      profileForm,
      passwordForm,
      userPhotoURL,
      fileInput,
      uploadingImage,
      savingProfile,
      savingPassword,
      triggerFileInput,
      handleFileSelect,
      handleImageError,
      removePhoto,
      saveProfileInfo,
      savePassword,
      closeDialog,
    }
  },
})
</script>

<style scoped>
.profile-editor-card {
  min-height: 600px;
}

.q-tab-panel {
  padding: 24px;
}
</style>
