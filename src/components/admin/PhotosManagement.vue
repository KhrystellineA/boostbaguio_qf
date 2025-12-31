<template>
  <div>
    <div class="row q-mb-md items-center">
      <div class="col">
        <h4 class="q-my-none text-pine-green">Page Photos Management</h4>
        <p class="text-grey-7 q-mb-none">Manage header/hero images for each page</p>
      </div>
    </div>

    <!-- HOME PAGE SECTION -->
    <div class="section-header q-mb-md">
      <div class="section-icon">
        <q-icon name="home" size="24px" />
      </div>
      <div class="section-info">
        <div class="section-title">Landing Page (Home)</div>
        <div class="section-description">All images for the main landing page sections</div>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-xl">
      <!-- HOME HERO Card -->
      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="photo-card home-card">
          <q-card-section class="photo-header home-header" style="background: linear-gradient(135deg, #1b4332 0%, #081c15 100%)">
            <div class="page-label">
              <q-icon name="star" size="20px" class="q-mr-xs" />
              HOME - HERO
            </div>
            <div class="page-description">Main Hero Section</div>
          </q-card-section>

          <q-card-section class="photo-preview">
            <div class="image-wrapper">
              <img 
                v-if="pages.home.imageUrl" 
                :src="pages.home.imageUrl" 
                alt="HOME hero" 
                class="preview-image"
              />
              <div v-else class="image-placeholder">
                <q-icon name="home" size="64px" color="grey-4" />
                <p class="text-grey-6 q-mt-sm">No image uploaded</p>
              </div>
            </div>
          </q-card-section>

          <q-card-actions class="q-pa-md">
            <q-btn
              unelevated
              style="background: #1b4332; color: white"
              label="Change Image"
              icon="photo_camera"
              no-caps
              class="full-width home-btn"
              @click="openUploadDialog('home')"
            >
              <q-badge 
                color="warning" 
                floating 
                rounded 
                label="Primary"
                style="top: -8px; right: -8px; font-size: 0.65rem; padding: 2px 6px"
              />
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>

      <!-- HOME FEATURES Card -->
      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="photo-card">
          <q-card-section class="photo-header" style="background: linear-gradient(135deg, #2d5a47 0%, #1b4332 100%)">
            <div class="page-label">HOME - FEATURES</div>
            <div class="page-description">Features Section Image</div>
          </q-card-section>

          <q-card-section class="photo-preview">
            <div class="image-wrapper">
              <img 
                v-if="pages.homeFeatures.imageUrl" 
                :src="pages.homeFeatures.imageUrl" 
                alt="HOME features" 
                class="preview-image"
              />
              <div v-else class="image-placeholder">
                <q-icon name="stars" size="64px" color="grey-4" />
                <p class="text-grey-6 q-mt-sm">No image uploaded</p>
              </div>
            </div>
          </q-card-section>

          <q-card-actions class="q-pa-md">
            <q-btn
              unelevated
              style="background: #2d5a47; color: white"
              label="Change Image"
              icon="photo_camera"
              no-caps
              class="full-width"
              @click="openUploadDialog('home-features')"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- HOME GUIDE Card -->
      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="photo-card">
          <q-card-section class="photo-header" style="background: linear-gradient(135deg, #2d5a47 0%, #1b4332 100%)">
            <div class="page-label">
              HOME - GUIDE
              <q-badge 
                v-if="pages.homeGuide.length > 0"
                :label="`${pages.homeGuide.length}/3`" 
                color="white"
                text-color="primary"
                class="q-ml-sm"
              />
            </div>
            <div class="page-description">Guide Steps (3 Images)</div>
          </q-card-section>

          <q-card-section class="photo-preview">
            <div v-if="pages.homeGuide.length > 0" class="guide-steps-grid">
              <div 
                v-for="(image, index) in pages.homeGuide.slice(0, 3)" 
                :key="index"
                class="step-thumbnail"
              >
                <img :src="image.imageUrl" :alt="`Step ${index + 1}`" />
                <div class="step-number">{{ index + 1 }}</div>
              </div>
              <!-- Placeholder for empty steps -->
              <div 
                v-for="n in (3 - pages.homeGuide.length)"
                :key="`empty-${n}`"
                class="step-thumbnail empty"
              >
                <q-icon name="add_photo_alternate" size="32px" color="grey-4" />
                <div class="step-number">{{ pages.homeGuide.length + n }}</div>
              </div>
            </div>
            <div v-else class="image-placeholder">
              <q-icon name="map" size="64px" color="grey-4" />
              <p class="text-grey-6 q-mt-sm">No step images uploaded</p>
            </div>
          </q-card-section>

          <q-card-actions class="q-pa-md">
            <q-btn
              unelevated
              style="background: #2d5a47; color: white"
              label="Manage Steps"
              icon="view_carousel"
              no-caps
              class="full-width"
              @click="openGuideDialog()"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- HOME ABOUT Card -->
      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="photo-card">
          <q-card-section class="photo-header" style="background: linear-gradient(135deg, #2d5a47 0%, #1b4332 100%)">
            <div class="page-label">HOME - ABOUT</div>
            <div class="page-description">About Section Image</div>
          </q-card-section>

          <q-card-section class="photo-preview">
            <div class="image-wrapper">
              <img 
                v-if="pages.homeAbout.imageUrl" 
                :src="pages.homeAbout.imageUrl" 
                alt="HOME about" 
                class="preview-image"
              />
              <div v-else class="image-placeholder">
                <q-icon name="info" size="64px" color="grey-4" />
                <p class="text-grey-6 q-mt-sm">No image uploaded</p>
              </div>
            </div>
          </q-card-section>

          <q-card-actions class="q-pa-md">
            <q-btn
              unelevated
              style="background: #2d5a47; color: white"
              label="Change Image"
              icon="photo_camera"
              no-caps
              class="full-width"
              @click="openUploadDialog('home-about')"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- HOME GALLERY Card -->
      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="photo-card">
          <q-card-section class="photo-header" style="background: linear-gradient(135deg, #2d5a47 0%, #1b4332 100%)">
            <div class="page-label">
              HOME - GALLERY
              <q-badge 
                v-if="pages.homeGallery.length > 0"
                :label="`${pages.homeGallery.length}`" 
                color="white"
                text-color="primary"
                class="q-ml-sm"
              />
            </div>
            <div class="page-description">Gallery Section (Multiple Images)</div>
          </q-card-section>

          <q-card-section class="photo-preview">
            <div v-if="pages.homeGallery.length > 0" class="gallery-grid">
              <div 
                v-for="(image, index) in pages.homeGallery.slice(0, 4)" 
                :key="index"
                class="gallery-thumbnail"
              >
                <img :src="image.imageUrl" :alt="`Gallery ${index + 1}`" />
                <div v-if="index === 3 && pages.homeGallery.length > 4" class="more-overlay">
                  <span>+{{ pages.homeGallery.length - 4 }}</span>
                </div>
              </div>
            </div>
            <div v-else class="image-placeholder">
              <q-icon name="photo_library" size="64px" color="grey-4" />
              <p class="text-grey-6 q-mt-sm">No images uploaded</p>
            </div>
          </q-card-section>

          <q-card-actions class="q-pa-md">
            <q-btn
              unelevated
              style="background: #2d5a47; color: white"
              label="Manage Gallery"
              icon="collections"
              no-caps
              class="full-width"
              @click="openGalleryDialog()"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- VISUAL SPACER / DIVIDER -->
    <q-separator class="q-my-xl" />

    <!-- OTHER PAGES SECTION -->
    <div class="section-header q-mb-md">
      <div class="section-icon">
        <q-icon name="pages" size="24px" />
      </div>
      <div class="section-info">
        <div class="section-title">Feature Pages</div>
        <div class="section-description">Hero and content images for app features</div>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <!-- APANAM Card -->
      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="photo-card">
          <q-card-section class="photo-header">
            <div class="page-label">APANAM</div>
            <div class="page-description">Jeepney Navigation Page</div>
          </q-card-section>

          <q-card-section class="photo-preview">
            <div class="image-wrapper">
              <img 
                v-if="pages.apanam.imageUrl" 
                :src="pages.apanam.imageUrl" 
                alt="APANAM hero" 
                class="preview-image"
              />
              <div v-else class="image-placeholder">
                <q-icon name="image" size="64px" color="grey-4" />
                <p class="text-grey-6 q-mt-sm">No image uploaded</p>
              </div>
            </div>
          </q-card-section>

          <q-card-actions class="q-pa-md">
            <q-btn
              unelevated
              style="background: #2d6a4f; color: white"
              label="Change Image"
              icon="photo_camera"
              no-caps
              class="full-width"
              @click="openUploadDialog('apanam')"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- MAYKAN Card -->
      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="photo-card">
          <q-card-section class="photo-header">
            <div class="page-label">MAYKAN</div>
            <div class="page-description">Places Discovery Page</div>
          </q-card-section>

          <q-card-section class="photo-preview">
            <div class="image-wrapper">
              <img 
                v-if="pages.maykan.imageUrl" 
                :src="pages.maykan.imageUrl" 
                alt="MAYKAN hero" 
                class="preview-image"
              />
              <div v-else class="image-placeholder">
                <q-icon name="image" size="64px" color="grey-4" />
                <p class="text-grey-6 q-mt-sm">No image uploaded</p>
              </div>
            </div>
          </q-card-section>

          <q-card-actions class="q-pa-md">
            <q-btn
              unelevated
              style="background: #2d6a4f; color: white"
              label="Change Image"
              icon="photo_camera"
              no-caps
              class="full-width"
              @click="openUploadDialog('maykan')"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- PAGNAAM Hero Card -->
      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="photo-card">
          <q-card-section class="photo-header">
            <div class="page-label">PAGNAAM</div>
            <div class="page-description">Hero Section (Routes Landing)</div>
          </q-card-section>

          <q-card-section class="photo-preview">
            <div class="image-wrapper">
              <img 
                v-if="pages.pagnaam.imageUrl" 
                :src="pages.pagnaam.imageUrl" 
                alt="PAGNAAM hero" 
                class="preview-image"
              />
              <div v-else class="image-placeholder">
                <q-icon name="image" size="64px" color="grey-4" />
                <p class="text-grey-6 q-mt-sm">No image uploaded</p>
              </div>
            </div>
          </q-card-section>

          <q-card-actions class="q-pa-md">
            <q-btn
              unelevated
              style="background: #2d6a4f; color: white"
              label="Change Image"
              icon="photo_camera"
              no-caps
              class="full-width"
              @click="openUploadDialog('pagnaam')"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- PAGNAAM Features Card -->
      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="photo-card">
          <q-card-section class="photo-header" style="background: linear-gradient(135deg, #4a5f4e 0%, #3a4f3e 100%)">
            <div class="page-label">PAGNAAM</div>
            <div class="page-description">Features Section (Jeepney Image)</div>
          </q-card-section>

          <q-card-section class="photo-preview">
            <div class="image-wrapper">
              <img 
                v-if="pages.pagnaamFeatures.imageUrl" 
                :src="pages.pagnaamFeatures.imageUrl" 
                alt="PAGNAAM features" 
                class="preview-image"
              />
              <div v-else class="image-placeholder">
                <q-icon name="directions_bus" size="64px" color="grey-4" />
                <p class="text-grey-6 q-mt-sm">No image uploaded</p>
              </div>
            </div>
          </q-card-section>

          <q-card-actions class="q-pa-md">
            <q-btn
              unelevated
              style="background: #4a5f4e; color: white"
              label="Change Image"
              icon="add_photo_alternate"
              no-caps
              class="full-width"
              @click="openUploadDialog('pagnaam-features')"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- AYAN MO Hero Card -->
      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="photo-card">
          <q-card-section class="photo-header">
            <div class="page-label">AYAN MO</div>
            <div class="page-description">Hero Section (Nearby Places)</div>
          </q-card-section>

          <q-card-section class="photo-preview">
            <div class="image-wrapper">
              <img 
                v-if="pages.ayanmo.imageUrl" 
                :src="pages.ayanmo.imageUrl" 
                alt="AYAN MO hero" 
                class="preview-image"
              />
              <div v-else class="image-placeholder">
                <q-icon name="image" size="64px" color="grey-4" />
                <p class="text-grey-6 q-mt-sm">No image uploaded</p>
              </div>
            </div>
          </q-card-section>

          <q-card-actions class="q-pa-md">
            <q-btn
              unelevated
              style="background: #2d6a4f; color: white"
              label="Change Image"
              icon="photo_camera"
              no-caps
              class="full-width"
              @click="openUploadDialog('ayanmo')"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- AYAN MO Discovery Card -->
      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="photo-card">
          <q-card-section class="photo-header" style="background: linear-gradient(135deg, #4a5f4e 0%, #3a4f3e 100%)">
            <div class="page-label">AYAN MO</div>
            <div class="page-description">Discovery Section Image</div>
          </q-card-section>

          <q-card-section class="photo-preview">
            <div class="image-wrapper">
              <img 
                v-if="pages.ayanmoDiscovery.imageUrl" 
                :src="pages.ayanmoDiscovery.imageUrl" 
                alt="AYAN MO discovery" 
                class="preview-image"
              />
              <div v-else class="image-placeholder">
                <q-icon name="explore" size="64px" color="grey-4" />
                <p class="text-grey-6 q-mt-sm">No image uploaded</p>
              </div>
            </div>
          </q-card-section>

          <q-card-actions class="q-pa-md">
            <q-btn
              unelevated
              style="background: #4a5f4e; color: white"
              label="Change Image"
              icon="landscape"
              no-caps
              class="full-width"
              @click="openUploadDialog('ayanmo-discovery')"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- ARAMIDEM Card -->
      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="photo-card">
          <q-card-section class="photo-header">
            <div class="page-label">ARAMIDEM</div>
            <div class="page-description">Events Page</div>
          </q-card-section>

          <q-card-section class="photo-preview">
            <div class="image-wrapper">
              <img 
                v-if="pages.aramidem.imageUrl" 
                :src="pages.aramidem.imageUrl" 
                alt="ARAMIDEM hero" 
                class="preview-image"
              />
              <div v-else class="image-placeholder">
                <q-icon name="image" size="64px" color="grey-4" />
                <p class="text-grey-6 q-mt-sm">No image uploaded</p>
              </div>
            </div>
          </q-card-section>

          <q-card-actions class="q-pa-md">
            <q-btn
              unelevated
              style="background: #2d6a4f; color: white"
              label="Change Image"
              icon="photo_camera"
              no-caps
              class="full-width"
              @click="openUploadDialog('aramidem')"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Upload Dialog -->
    <q-dialog v-model="showUploadDialog" @hide="onDialogHide">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6 text-pine-green">
            Change {{ selectedPage ? pageNames[selectedPage] : '' }} Image
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <!-- Current Image Preview -->
          <div v-if="selectedPage && getCurrentPageImage()" class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">Current Image:</div>
            <div class="current-image-preview">
              <img :src="getCurrentPageImage()" alt="Current" />
            </div>
          </div>

          <q-separator class="q-my-md" />

          <!-- New Image Preview -->
          <div v-if="imagePreview" class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">New Image Preview:</div>
            <div class="new-image-preview">
              <img :src="imagePreview" alt="Preview" />
              <q-btn
                round
                dense
                icon="close"
                color="negative"
                size="sm"
                class="remove-image-btn"
                @click="removeImage"
              >
                <q-tooltip>Remove</q-tooltip>
              </q-btn>
            </div>
          </div>

          <!-- Upload Button -->
          <q-file
            v-model="imageFile"
            outlined
            :label="getUploadLabel()"
            accept="image/*"
            max-file-size="10485760"
            @update:model-value="onImageSelected"
            @rejected="onImageRejected"
          >
            <template #prepend>
              <q-icon name="image" />
            </template>
            <template #hint>
              Max 10MB • Recommended: 1920x1080px or wider • JPG, PNG, WebP
            </template>
          </q-file>

          <q-banner class="bg-blue-1 q-mt-md" dense>
            <template #avatar>
              <q-icon name="info" color="primary" />
            </template>
            <div class="text-caption">
              <strong>Tip:</strong> 
              <span v-if="selectedPage === 'home'">
                Use a high-quality landscape image of Baguio City for the main hero. This is the first thing visitors see!
              </span>
              <span v-else-if="selectedPage === 'home-features'">
                Use an engaging image that showcases app features or benefits. Landscape orientation works best.
              </span>
              <span v-else-if="selectedPage === 'home-guide'">
                Use an image that represents guidance or navigation in Baguio. Consider maps or jeepney routes.
              </span>
              <span v-else-if="selectedPage === 'home-about'">
                Use an image that represents the story behind BaguioBoostPH or team/community imagery.
              </span>
              <span v-else-if="selectedPage === 'ayanmo-discovery'">
                Use a vertical or square image (4:3 ratio) for the discovery section. This appears next to the text content.
              </span>
              <span v-else-if="selectedPage === 'pagnaam-features'">
                Use a high-quality jeepney photo (landscape) for the features section. This showcases Baguio's transportation.
              </span>
              <span v-else>
                Use high-quality, landscape-oriented images for best results. The image will be used as the hero/header background.
              </span>
            </div>
          </q-banner>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Upload & Save"
            style="background: #2d6a4f; color: white"
            :loading="uploading"
            :disable="!imageFile"
            @click="uploadImage"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Gallery Management Dialog -->
    <q-dialog v-model="showGalleryDialog" maximized>
      <q-card>
        <q-card-section class="bg-pine-green text-white">
          <div class="row items-center">
            <div class="col">
              <div class="text-h5">Gallery Management</div>
              <div class="text-caption">Manage multiple images for the gallery section</div>
            </div>
            <q-btn flat round dense icon="close" v-close-popup />
          </div>
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <!-- Upload New Images -->
          <div class="q-mb-xl">
            <div class="text-h6 q-mb-md">Upload New Images</div>
            <q-file
              v-model="galleryFiles"
              multiple
              outlined
              label="Select multiple images"
              accept="image/*"
              max-file-size="10485760"
              counter
              @update:model-value="onGalleryImagesSelected"
              @rejected="onImageRejected"
            >
              <template #prepend>
                <q-icon name="add_photo_alternate" />
              </template>
              <template #hint>
                Select multiple images (max 10MB each) • JPG, PNG, WebP
              </template>
            </q-file>

            <!-- Preview New Images -->
            <div v-if="galleryPreviews.length > 0" class="q-mt-md">
              <div class="text-subtitle2 q-mb-sm">New Images to Upload:</div>
              <div class="preview-grid">
                <div 
                  v-for="(preview, index) in galleryPreviews" 
                  :key="'preview-' + index"
                  class="preview-item"
                >
                  <img :src="preview" alt="Preview" />
                  <q-btn
                    round
                    dense
                    icon="close"
                    color="negative"
                    size="sm"
                    class="remove-preview-btn"
                    @click="removeGalleryPreview(index)"
                  >
                    <q-tooltip>Remove</q-tooltip>
                  </q-btn>
                </div>
              </div>

              <q-btn
                unelevated
                style="background: #2d6a4f; color: white"
                label="Upload Selected Images"
                icon="cloud_upload"
                class="q-mt-md"
                :loading="uploadingGallery"
                @click="uploadGalleryImages"
              />
            </div>
          </div>

          <q-separator class="q-my-lg" />

          <!-- Current Gallery Images -->
          <div>
            <div class="row items-center q-mb-md">
              <div class="col">
                <div class="text-h6">Current Gallery Images</div>
                <div class="text-caption text-grey-7">{{ pages.homeGallery.length }} images</div>
              </div>
              <q-btn
                v-if="pages.homeGallery.length > 0"
                flat
                color="negative"
                label="Clear All"
                icon="delete_sweep"
                @click="confirmClearGallery"
              />
            </div>

            <div v-if="pages.homeGallery.length > 0" class="gallery-management-grid">
              <q-card
                v-for="(image, index) in pages.homeGallery"
                :key="image.imagePath"
                class="gallery-item-card"
              >
                <q-img :src="image.imageUrl" :ratio="1" />
                <q-card-section class="absolute-bottom text-center bg-transparent">
                  <q-btn
                    round
                    color="negative"
                    icon="delete"
                    size="sm"
                    @click="deleteGalleryImage(index)"
                  >
                    <q-tooltip>Delete Image</q-tooltip>
                  </q-btn>
                </q-card-section>
              </q-card>
            </div>

            <div v-else class="text-center q-pa-xl text-grey-6">
              <q-icon name="photo_library" size="80px" />
              <p class="q-mt-md">No gallery images yet. Upload some above!</p>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="Close" color="grey-7" flat v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Guide Steps Management Dialog -->
    <q-dialog v-model="showGuideDialog" maximized>
      <q-card>
        <q-card-section class="bg-pine-green text-white">
          <div class="row items-center">
            <div class="col">
              <div class="text-h5">Guide Steps Management</div>
              <div class="text-caption">Manage 3 step images for the guide section</div>
            </div>
            <q-btn flat round dense icon="close" v-close-popup />
          </div>
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <!-- Current Guide Steps -->
          <div class="q-mb-lg">
            <div class="text-h6 q-mb-md">Current Step Images ({{ pages.homeGuide.length }}/3)</div>
            
            <div class="guide-steps-management">
              <!-- Step 1 -->
              <q-card 
                class="step-card" 
                :class="{ 'has-image': pages.homeGuide[0] }"
              >
                <div class="step-header">
                  <q-badge color="pine-green" label="Step 1" />
                  <span class="step-title">Input Start & End Points</span>
                </div>
                <div class="step-content">
                  <div v-if="pages.homeGuide[0]" class="step-image-preview">
                    <q-img :src="pages.homeGuide[0].imageUrl" :ratio="16/9" />
                    <q-btn
                      round
                      dense
                      icon="delete"
                      color="negative"
                      size="sm"
                      class="delete-step-btn"
                      @click="deleteGuideStep(0)"
                    >
                      <q-tooltip>Delete Step 1</q-tooltip>
                    </q-btn>
                  </div>
                  <div v-else class="step-empty">
                    <q-icon name="add_photo_alternate" size="48px" color="grey-4" />
                    <p class="text-grey-6">No image for Step 1</p>
                    <q-file
                      v-model="guideStepFiles[0]"
                      outlined
                      dense
                      label="Upload Step 1 Image"
                      accept="image/*"
                      max-file-size="10485760"
                      @update:model-value="onGuideStepSelected(0)"
                      @rejected="onImageRejected"
                    >
                      <template #prepend>
                        <q-icon name="image" />
                      </template>
                    </q-file>
                  </div>
                </div>
              </q-card>

              <!-- Step 2 -->
              <q-card 
                class="step-card" 
                :class="{ 'has-image': pages.homeGuide[1] }"
              >
                <div class="step-header">
                  <q-badge color="pine-green" label="Step 2" />
                  <span class="step-title">Follow Suggested Route</span>
                </div>
                <div class="step-content">
                  <div v-if="pages.homeGuide[1]" class="step-image-preview">
                    <q-img :src="pages.homeGuide[1].imageUrl" :ratio="16/9" />
                    <q-btn
                      round
                      dense
                      icon="delete"
                      color="negative"
                      size="sm"
                      class="delete-step-btn"
                      @click="deleteGuideStep(1)"
                    >
                      <q-tooltip>Delete Step 2</q-tooltip>
                    </q-btn>
                  </div>
                  <div v-else class="step-empty">
                    <q-icon name="add_photo_alternate" size="48px" color="grey-4" />
                    <p class="text-grey-6">No image for Step 2</p>
                    <q-file
                      v-model="guideStepFiles[1]"
                      outlined
                      dense
                      label="Upload Step 2 Image"
                      accept="image/*"
                      max-file-size="10485760"
                      @update:model-value="onGuideStepSelected(1)"
                      @rejected="onImageRejected"
                    >
                      <template #prepend>
                        <q-icon name="image" />
                      </template>
                    </q-file>
                  </div>
                </div>
              </q-card>

              <!-- Step 3 -->
              <q-card 
                class="step-card" 
                :class="{ 'has-image': pages.homeGuide[2] }"
              >
                <div class="step-header">
                  <q-badge color="pine-green" label="Step 3" />
                  <span class="step-title">Discover Local Attractions</span>
                </div>
                <div class="step-content">
                  <div v-if="pages.homeGuide[2]" class="step-image-preview">
                    <q-img :src="pages.homeGuide[2].imageUrl" :ratio="16/9" />
                    <q-btn
                      round
                      dense
                      icon="delete"
                      color="negative"
                      size="sm"
                      class="delete-step-btn"
                      @click="deleteGuideStep(2)"
                    >
                      <q-tooltip>Delete Step 3</q-tooltip>
                    </q-btn>
                  </div>
                  <div v-else class="step-empty">
                    <q-icon name="add_photo_alternate" size="48px" color="grey-4" />
                    <p class="text-grey-6">No image for Step 3</p>
                    <q-file
                      v-model="guideStepFiles[2]"
                      outlined
                      dense
                      label="Upload Step 3 Image"
                      accept="image/*"
                      max-file-size="10485760"
                      @update:model-value="onGuideStepSelected(2)"
                      @rejected="onImageRejected"
                    >
                      <template #prepend>
                        <q-icon name="image" />
                      </template>
                    </q-file>
                  </div>
                </div>
              </q-card>
            </div>

            <q-banner v-if="pages.homeGuide.length < 3" rounded class="bg-warning text-white q-mt-md">
              <template #avatar>
                <q-icon name="info" color="white" />
              </template>
              <strong>Note:</strong> All 3 steps should have images for the best user experience.
              Currently {{ 3 - pages.homeGuide.length }} step(s) missing images.
            </q-banner>
          </div>

          <q-separator class="q-my-lg" />

          <!-- Tips -->
          <div class="tips-section">
            <div class="text-subtitle2 q-mb-sm">📸 Image Guidelines:</div>
            <ul class="text-caption text-grey-7">
              <li>Recommended size: 1200x800px (16:9 ratio)</li>
              <li>Maximum file size: 10MB per image</li>
              <li>Formats: JPG, PNG, WebP</li>
              <li>Use clear, high-quality images that illustrate each step</li>
            </ul>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn 
            v-if="pages.homeGuide.length > 0"
            label="Clear All Steps" 
            color="negative" 
            flat 
            icon="delete_sweep"
            @click="confirmClearGuideSteps"
          />
          <q-btn label="Close" color="grey-7" flat v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { db } from 'src/boot/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { useQuasar } from 'quasar'

export default {
  name: 'PhotosManagement',

  setup() {
    const $q = useQuasar()
    return { $q }
  },

  data() {
    return {
      pages: {
        home: { imageUrl: '', imagePath: '' },
        homeFeatures: { imageUrl: '', imagePath: '' },
        homeGuide: [], 
        homeAbout: { imageUrl: '', imagePath: '' },
        homeGallery: [], 
        apanam: { imageUrl: '', imagePath: '' },
        maykan: { imageUrl: '', imagePath: '' },
        pagnaam: { imageUrl: '', imagePath: '' },
        pagnaamFeatures: { imageUrl: '', imagePath: '' },
        ayanmo: { imageUrl: '', imagePath: '' },
        ayanmoDiscovery: { imageUrl: '', imagePath: '' },
        aramidem: { imageUrl: '', imagePath: '' },
      },
      pageNames: {
        home: 'HOME (Hero Section)',
        'home-features': 'HOME (Features Section)',
        'home-guide': 'HOME (Guide Steps - 3 Images)',
        'home-about': 'HOME (About Section)',
        'home-gallery': 'HOME (Gallery Section)',
        apanam: 'APANAM',
        maykan: 'MAYKAN',
        pagnaam: 'PAGNAAM (Hero)',
        'pagnaam-features': 'PAGNAAM (Features Section)',
        ayanmo: 'AYAN MO (Hero)',
        'ayanmo-discovery': 'AYAN MO (Discovery Section)',
        aramidem: 'ARAMIDEM',
      },
      showUploadDialog: false,
      showGalleryDialog: false,
      showGuideDialog: false,
      selectedPage: null,
      imageFile: null,
      imagePreview: null,
      uploading: false,
      galleryFiles: null,
      galleryPreviews: [],
      uploadingGallery: false,
      guideStepFiles: [null, null, null], 
      uploadingGuideStep: false,
    }
  },

  mounted() {
    this.loadAllPhotos()
  },

  methods: {
    async loadAllPhotos() {
      try {
        console.log('[Photos] Loading all page photos...')
        
        for (const pageName of ['home', 'apanam', 'maykan', 'pagnaam', 'ayanmo', 'aramidem']) {
          const docRef = doc(db, 'pagePhotos', pageName)
          const docSnap = await getDoc(docRef)
          
          if (docSnap.exists()) {
            const data = docSnap.data()
            this.pages[pageName] = {
              imageUrl: data.imageUrl || '',
              imagePath: data.imagePath || '',
            }
          }
        }

        for (const section of ['home-features', 'home-about']) {
          const docRef = doc(db, 'pagePhotos', section)
          const docSnap = await getDoc(docRef)
          
          if (docSnap.exists()) {
            const data = docSnap.data()
            const camelCase = section.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
            this.pages[camelCase] = {
              imageUrl: data.imageUrl || '',
              imagePath: data.imagePath || '',
            }
          }
        }

        const guideRef = doc(db, 'pagePhotos', 'home-guide')
        const guideSnap = await getDoc(guideRef)
        if (guideSnap.exists()) {
          const data = guideSnap.data()
          this.pages.homeGuide = data.images || []
          console.log('[PhotosManagement] Loaded', this.pages.homeGuide.length, 'guide step images')
        }

        const galleryRef = doc(db, 'pagePhotos', 'home-gallery')
        const gallerySnap = await getDoc(galleryRef)
        
        if (gallerySnap.exists()) {
          const data = gallerySnap.data()
          this.pages.homeGallery = data.images || []
        } else {
          this.pages.homeGallery = []
        }

        const pagnaamFeaturesRef = doc(db, 'pagePhotos', 'pagnaam-features')
        const pagnaamFeaturesSnap = await getDoc(pagnaamFeaturesRef)
        
        if (pagnaamFeaturesSnap.exists()) {
          const data = pagnaamFeaturesSnap.data()
          this.pages.pagnaamFeatures = {
            imageUrl: data.imageUrl || '',
            imagePath: data.imagePath || '',
          }
        }

        const discoveryDocRef = doc(db, 'pagePhotos', 'ayanmo-discovery')
        const discoverySnap = await getDoc(discoveryDocRef)
        
        if (discoverySnap.exists()) {
          const data = discoverySnap.data()
          this.pages.ayanmoDiscovery = {
            imageUrl: data.imageUrl || '',
            imagePath: data.imagePath || '',
          }
        }
        
        console.log('[Photos] All photos loaded:', this.pages)
      } catch (error) {
        console.error('[Photos] Error loading:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to load page photos',
          position: 'top'
        })
      }
    },

    openUploadDialog(pageName) {
      this.selectedPage = pageName
      this.showUploadDialog = true
    },

    getCurrentPageImage() {
      if (!this.selectedPage) return ''
      
      if (this.selectedPage === 'home-gallery') return ''
      
      if (this.selectedPage === 'ayanmo-discovery') {
        return this.pages.ayanmoDiscovery.imageUrl
      }
      
      if (this.selectedPage === 'pagnaam-features') {
        return this.pages.pagnaamFeatures.imageUrl
      }

      if (this.selectedPage.startsWith('home-')) {
        const camelCase = this.selectedPage.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
        return this.pages[camelCase]?.imageUrl || ''
      }
      
      return this.pages[this.selectedPage]?.imageUrl || ''
    },

    getUploadLabel() {
      if (this.selectedPage === 'home') {
        return 'Choose Hero Image'
      }
      if (this.selectedPage === 'home-features') {
        return 'Choose Features Image'
      }
      if (this.selectedPage === 'home-guide') {
        return 'Choose Guide Image'
      }
      if (this.selectedPage === 'home-about') {
        return 'Choose About Image'
      }
      if (this.selectedPage === 'ayanmo-discovery') {
        return 'Choose Discovery Image'
      }
      if (this.selectedPage === 'pagnaam-features') {
        return 'Choose Features Image'
      }
      return 'Choose Hero Image'
    },

    onImageSelected(file) {
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.imagePreview = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },

    onImageRejected(rejectedEntries) {
      const reason = rejectedEntries[0]?.failedPropValidation
      let message = 'Image upload failed'
      
      if (reason === 'max-file-size') {
        message = 'Image size must be less than 10MB'
      } else if (reason === 'accept') {
        message = 'Only image files are allowed'
      }
      
      this.$q.notify({
        type: 'negative',
        message: message,
        position: 'top'
      })
    },

    removeImage() {
      this.imageFile = null
      this.imagePreview = null
    },

    async uploadImage() {
      if (!this.imageFile || !this.selectedPage) return

      this.uploading = true

      try {
        const storage = getStorage()
        const timestamp = Date.now()
        const fileName = `${this.selectedPage}_${timestamp}_${this.imageFile.name}`
        const storageRef = ref(storage, `pagePhotos/${fileName}`)

        let oldImagePath = ''
        if (this.selectedPage === 'ayanmo-discovery') {
          oldImagePath = this.pages.ayanmoDiscovery.imagePath
        } else if (this.selectedPage === 'pagnaam-features') {
          oldImagePath = this.pages.pagnaamFeatures.imagePath
        } else if (this.selectedPage.startsWith('home-')) {
          const camelCase = this.selectedPage.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
          oldImagePath = this.pages[camelCase]?.imagePath || ''
        } else {
          oldImagePath = this.pages[this.selectedPage]?.imagePath || ''
        }

        if (oldImagePath) {
          try {
            const oldImageRef = ref(storage, oldImagePath)
            await deleteObject(oldImageRef)
            console.log('[Photos] Old image deleted:', oldImagePath)
          } catch (error) {
            console.log('[Photos] No old image to delete or error:', error.message)
          }
        }

        console.log('[Photos] Uploading new image...')
        await uploadBytes(storageRef, this.imageFile)
        const downloadURL = await getDownloadURL(storageRef)

        const docRef = doc(db, 'pagePhotos', this.selectedPage)
        await setDoc(docRef, {
          pageName: this.selectedPage,
          imageUrl: downloadURL,
          imagePath: `pagePhotos/${fileName}`,
          updatedAt: serverTimestamp(),
        })

        if (this.selectedPage === 'ayanmo-discovery') {
          this.pages.ayanmoDiscovery = {
            imageUrl: downloadURL,
            imagePath: `pagePhotos/${fileName}`,
          }
        } else if (this.selectedPage === 'pagnaam-features') {
          this.pages.pagnaamFeatures = {
            imageUrl: downloadURL,
            imagePath: `pagePhotos/${fileName}`,
          }
        } else if (this.selectedPage.startsWith('home-')) {
          const camelCase = this.selectedPage.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
          this.pages[camelCase] = {
            imageUrl: downloadURL,
            imagePath: `pagePhotos/${fileName}`,
          }
        } else {
          this.pages[this.selectedPage] = {
            imageUrl: downloadURL,
            imagePath: `pagePhotos/${fileName}`,
          }
        }

        this.$q.notify({
          type: 'positive',
          message: `${this.pageNames[this.selectedPage]} image updated successfully!`,
          position: 'top',
          icon: 'check_circle'
        })

        this.showUploadDialog = false
        this.resetForm()

      } catch (error) {
        console.error('[Photos] Error uploading:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to upload image: ' + error.message,
          position: 'top'
        })
      } finally {
        this.uploading = false
      }
    },

    resetForm() {
      this.imageFile = null
      this.imagePreview = null
      this.selectedPage = null
    },

    onDialogHide() {
      this.resetForm()
    },

    openGalleryDialog() {
      this.showGalleryDialog = true
    },

    onGalleryImagesSelected(files) {
      if (files && files.length > 0) {
        this.galleryPreviews = []
        
        Array.from(files).forEach((file) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            this.galleryPreviews.push(e.target.result)
          }
          reader.readAsDataURL(file)
        })
      }
    },

    removeGalleryPreview(index) {
      this.galleryPreviews.splice(index, 1)
      
      if (this.galleryFiles) {
        const dt = new DataTransfer()
        Array.from(this.galleryFiles).forEach((file, i) => {
          if (i !== index) {
            dt.items.add(file)
          }
        })
        this.galleryFiles = dt.files
      }
    },

    async uploadGalleryImages() {
      if (!this.galleryFiles || this.galleryFiles.length === 0) return

      this.uploadingGallery = true

      try {
        const storage = getStorage()
        const uploadedImages = []

        for (let i = 0; i < this.galleryFiles.length; i++) {
          const file = this.galleryFiles[i]
          const timestamp = Date.now()
          const fileName = `home-gallery_${timestamp}_${i}_${file.name}`
          const storageRef = ref(storage, `pagePhotos/gallery/${fileName}`)

          await uploadBytes(storageRef, file)
          const downloadURL = await getDownloadURL(storageRef)

          uploadedImages.push({
            imageUrl: downloadURL,
            imagePath: `pagePhotos/gallery/${fileName}`,
          })
        }

        this.pages.homeGallery.push(...uploadedImages)

        const docRef = doc(db, 'pagePhotos', 'home-gallery')
        await setDoc(docRef, {
          pageName: 'home-gallery',
          images: this.pages.homeGallery,
          updatedAt: serverTimestamp(),
        })

        this.$q.notify({
          type: 'positive',
          message: `${uploadedImages.length} image(s) uploaded successfully!`,
          position: 'top',
          icon: 'check_circle'
        })

        this.galleryFiles = null
        this.galleryPreviews = []

      } catch (error) {
        console.error('[Gallery] Error uploading:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to upload images: ' + error.message,
          position: 'top'
        })
      } finally {
        this.uploadingGallery = false
      }
    },

    async deleteGalleryImage(index) {
      this.$q.dialog({
        title: 'Delete Image',
        message: 'Are you sure you want to delete this image from the gallery?',
        cancel: true,
        persistent: false
      }).onOk(async () => {
        try {
          const storage = getStorage()
          const image = this.pages.homeGallery[index]

          if (image.imagePath) {
            try {
              const imageRef = ref(storage, image.imagePath)
              await deleteObject(imageRef)
            } catch (error) {
              console.log('[Gallery] Could not delete storage file:', error.message)
            }
          }

          this.pages.homeGallery.splice(index, 1)

          const docRef = doc(db, 'pagePhotos', 'home-gallery')
          await setDoc(docRef, {
            pageName: 'home-gallery',
            images: this.pages.homeGallery,
            updatedAt: serverTimestamp(),
          })

          this.$q.notify({
            type: 'positive',
            message: 'Image deleted successfully',
            position: 'top'
          })

        } catch (error) {
          console.error('[Gallery] Error deleting:', error)
          this.$q.notify({
            type: 'negative',
            message: 'Failed to delete image: ' + error.message,
            position: 'top'
          })
        }
      })
    },

    confirmClearGallery() {
      this.$q.dialog({
        title: 'Clear All Images',
        message: 'Are you sure you want to delete ALL gallery images? This action cannot be undone.',
        cancel: true,
        persistent: false,
        ok: {
          label: 'Clear All',
          color: 'negative'
        }
      }).onOk(async () => {
        try {
          const storage = getStorage()

          for (const image of this.pages.homeGallery) {
            if (image.imagePath) {
              try {
                const imageRef = ref(storage, image.imagePath)
                await deleteObject(imageRef)
              } catch (error) {
                console.log('[Gallery] Could not delete:', error.message)
              }
            }
          }

          this.pages.homeGallery = []

          const docRef = doc(db, 'pagePhotos', 'home-gallery')
          await setDoc(docRef, {
            pageName: 'home-gallery',
            images: [],
            updatedAt: serverTimestamp(),
          })

          this.$q.notify({
            type: 'positive',
            message: 'All gallery images cleared',
            position: 'top'
          })

        } catch (error) {
          console.error('[Gallery] Error clearing:', error)
          this.$q.notify({
            type: 'negative',
            message: 'Failed to clear gallery: ' + error.message,
            position: 'top'
          })
        }
      })
    },

    openGuideDialog() {
      this.showGuideDialog = true
    },

    async onGuideStepSelected(stepIndex) {
      const file = this.guideStepFiles[stepIndex]
      if (!file) return

      this.uploadingGuideStep = true

      try {
        const storage = getStorage()
        const timestamp = Date.now()
        const fileName = `home-guide_step${stepIndex + 1}_${timestamp}_${file.name}`
        const storageRef = ref(storage, `pagePhotos/guide/${fileName}`)

        await uploadBytes(storageRef, file)
        const downloadURL = await getDownloadURL(storageRef)

        if (this.pages.homeGuide[stepIndex] && this.pages.homeGuide[stepIndex].imagePath) {
          try {
            const oldImageRef = ref(storage, this.pages.homeGuide[stepIndex].imagePath)
            await deleteObject(oldImageRef)
          } catch (error) {
            console.log('[Guide] Could not delete old step image:', error.message)
          }
        }

        const newImage = {
          imageUrl: downloadURL,
          imagePath: `pagePhotos/guide/${fileName}`,
        }

        while (this.pages.homeGuide.length < 3) {
          this.pages.homeGuide.push(null)
        }
        
        this.pages.homeGuide[stepIndex] = newImage

        const docRef = doc(db, 'pagePhotos', 'home-guide')
        await setDoc(docRef, {
          pageName: 'home-guide',
          images: this.pages.homeGuide.filter(img => img !== null), 
          updatedAt: serverTimestamp(),
        })

        this.$q.notify({
          type: 'positive',
          message: `Step ${stepIndex + 1} image uploaded successfully!`,
          position: 'top',
          icon: 'check_circle'
        })

        this.guideStepFiles[stepIndex] = null

      } catch (error) {
        console.error('[Guide] Error uploading:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to upload step image: ' + error.message,
          position: 'top'
        })
      } finally {
        this.uploadingGuideStep = false
      }
    },

    async deleteGuideStep(stepIndex) {
      this.$q.dialog({
        title: 'Delete Step Image',
        message: `Are you sure you want to delete the image for Step ${stepIndex + 1}?`,
        cancel: true,
        persistent: false
      }).onOk(async () => {
        try {
          const storage = getStorage()
          const image = this.pages.homeGuide[stepIndex]

          if (image && image.imagePath) {
            try {
              const imageRef = ref(storage, image.imagePath)
              await deleteObject(imageRef)
            } catch (error) {
              console.log('[Guide] Could not delete storage file:', error.message)
            }
          }

          this.pages.homeGuide[stepIndex] = null

          const docRef = doc(db, 'pagePhotos', 'home-guide')
          await setDoc(docRef, {
            pageName: 'home-guide',
            images: this.pages.homeGuide.filter(img => img !== null), 
            updatedAt: serverTimestamp(),
          })

          this.$q.notify({
            type: 'positive',
            message: `Step ${stepIndex + 1} image deleted successfully`,
            position: 'top'
          })

        } catch (error) {
          console.error('[Guide] Error deleting:', error)
          this.$q.notify({
            type: 'negative',
            message: 'Failed to delete step image: ' + error.message,
            position: 'top'
          })
        }
      })
    },

    confirmClearGuideSteps() {
      this.$q.dialog({
        title: 'Clear All Step Images',
        message: 'Are you sure you want to delete ALL guide step images? This action cannot be undone.',
        cancel: true,
        persistent: false,
        ok: {
          label: 'Clear All Steps',
          color: 'negative'
        }
      }).onOk(async () => {
        try {
          const storage = getStorage()

          for (const image of this.pages.homeGuide) {
            if (image && image.imagePath) {
              try {
                const imageRef = ref(storage, image.imagePath)
                await deleteObject(imageRef)
              } catch (error) {
                console.log('[Guide] Could not delete:', error.message)
              }
            }
          }

          this.pages.homeGuide = []

          const docRef = doc(db, 'pagePhotos', 'home-guide')
          await setDoc(docRef, {
            pageName: 'home-guide',
            images: [],
            updatedAt: serverTimestamp(),
          })

          this.$q.notify({
            type: 'positive',
            message: 'All guide step images cleared',
            position: 'top'
          })

        } catch (error) {
          console.error('[Guide] Error clearing:', error)
          this.$q.notify({
            type: 'negative',
            message: 'Failed to clear guide steps: ' + error.message,
            position: 'top'
          })
        }
      })
    },
  },
}
</script>

<style lang="sass" scoped>
.text-pine-green
  color: #2d6a4f

.section-header
  display: flex
  align-items: center
  gap: 16px
  padding: 20px 24px
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)
  border-radius: 12px
  border-left: 4px solid #2d6a4f

  .section-icon
    display: flex
    align-items: center
    justify-content: center
    width: 48px
    height: 48px
    background: white
    border-radius: 10px
    color: #2d6a4f
    box-shadow: 0 2px 8px rgba(45, 106, 79, 0.1)

  .section-info
    flex: 1

    .section-title
      font-size: 1.25rem
      font-weight: 700
      color: #2d6a4f
      margin-bottom: 4px
      letter-spacing: 0.5px

    .section-description
      font-size: 0.875rem
      color: #6c757d
      font-weight: 500

.photo-card
  transition: all 0.3s ease

  &:hover
    transform: translateY(-4px)
    box-shadow: 0 8px 16px rgba(0,0,0,0.1)

  &.home-card
    border: 2px solid #1b4332
    box-shadow: 0 4px 20px rgba(27, 67, 50, 0.15)

    &:hover
      box-shadow: 0 8px 28px rgba(27, 67, 50, 0.25)
      transform: translateY(-6px)

.photo-header
  background: linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)
  color: white
  padding: 20px

  &.home-header
    position: relative
    
    &::before
      content: ''
      position: absolute
      top: 12px
      right: 12px
      width: 8px
      height: 8px
      background: #ffd700
      border-radius: 50%
      box-shadow: 0 0 10px #ffd700
      animation: pulse 2s ease-in-out infinite

  .page-label
    font-size: 1.5rem
    font-weight: 900
    letter-spacing: 1px
    margin-bottom: 4px
    display: flex
    align-items: center

  .page-description
    font-size: 0.85rem
    opacity: 0.9

.photo-preview
  padding: 0
  height: 250px

.image-wrapper
  width: 100%
  height: 100%
  position: relative
  background: #f5f5f5

.preview-image
  width: 100%
  height: 100%
  object-fit: cover
  display: block

.image-placeholder
  width: 100%
  height: 100%
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)

.current-image-preview
  width: 100%
  height: 200px
  border-radius: 8px
  overflow: hidden
  border: 2px solid #e0e0e0

  img
    width: 100%
    height: 100%
    object-fit: cover
    display: block

.new-image-preview
  position: relative
  width: 100%
  height: 250px
  border-radius: 8px
  overflow: hidden
  border: 2px solid #2d6a4f

  img
    width: 100%
    height: 100%
    object-fit: cover
    display: block

  .remove-image-btn
    position: absolute
    top: 8px
    right: 8px

@keyframes pulse
  0%, 100%
    opacity: 1
    transform: scale(1)
  50%
    opacity: 0.6
    transform: scale(1.2)

.home-btn
  transition: all 0.3s ease
  
  &:hover
    background: #0f2922 !important
    transform: translateY(-2px) !important
    box-shadow: 0 6px 20px rgba(27, 67, 50, 0.3) !important

@media (max-width: 768px)
  .section-header
    padding: 16px 20px
    
    .section-icon
      width: 40px
      height: 40px
    
    .section-info
      .section-title
        font-size: 1.1rem
      
      .section-description
        font-size: 0.8rem

.bg-pine-green
  background: #2d6a4f !important

.gallery-grid
  display: grid
  grid-template-columns: repeat(2, 1fr)
  gap: 4px
  height: 100%

  .gallery-thumbnail
    position: relative
    width: 100%
    padding-bottom: 100%
    overflow: hidden
    background: #f5f5f5

    img
      position: absolute
      top: 0
      left: 0
      width: 100%
      height: 100%
      object-fit: cover

    .more-overlay
      position: absolute
      top: 0
      left: 0
      width: 100%
      height: 100%
      background: rgba(0, 0, 0, 0.7)
      display: flex
      align-items: center
      justify-content: center
      color: white
      font-size: 2rem
      font-weight: bold

.preview-grid
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr))
  gap: 16px
  margin-top: 16px

  .preview-item
    position: relative
    width: 100%
    padding-bottom: 100%
    overflow: hidden
    border-radius: 8px
    border: 2px solid #e0e0e0

    img
      position: absolute
      top: 0
      left: 0
      width: 100%
      height: 100%
      object-fit: cover

    .remove-preview-btn
      position: absolute
      top: 8px
      right: 8px

.gallery-management-grid
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))
  gap: 16px

  .gallery-item-card
    position: relative
    overflow: hidden
    border-radius: 8px
    transition: transform 0.3s ease

    &:hover
      transform: translateY(-4px)

.guide-steps-grid
  display: grid
  grid-template-columns: repeat(3, 1fr)
  gap: 8px

  .step-thumbnail
    position: relative
    width: 100%
    padding-bottom: 75%
    overflow: hidden
    border-radius: 8px
    background: #e0e0e0

    &.empty
      display: flex
      align-items: center
      justify-content: center
      border: 2px dashed #ccc
      background: #f5f5f5

    img
      position: absolute
      top: 0
      left: 0
      width: 100%
      height: 100%
      object-fit: cover

    .step-number
      position: absolute
      bottom: 4px
      right: 4px
      background: rgba(45, 106, 79, 0.9)
      color: white
      width: 24px
      height: 24px
      border-radius: 50%
      display: flex
      align-items: center
      justify-content: center
      font-size: 12px
      font-weight: bold

.guide-steps-management
  display: grid
  grid-template-columns: 1fr
  gap: 20px

  .step-card
    border: 2px solid #e0e0e0
    transition: all 0.3s ease

    &.has-image
      border-color: #2d6a4f

    .step-header
      padding: 16px
      background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)
      display: flex
      align-items: center
      gap: 12px
      border-bottom: 1px solid #e0e0e0

      .step-title
        font-weight: 600
        color: #333

    .step-content
      padding: 16px

    .step-image-preview
      position: relative
      border-radius: 8px
      overflow: hidden

      .delete-step-btn
        position: absolute
        top: 12px
        right: 12px
        z-index: 10

    .step-empty
      text-align: center
      padding: 24px
      background: #f9f9f9
      border-radius: 8px
      border: 2px dashed #ccc

      p
        margin: 12px 0 16px 0

.bg-pine-green
  background: #2d6a4f !important

.tips-section
  background: #f5f5f5
  padding: 16px
  border-radius: 8px
  border-left: 4px solid #2d6a4f

  ul
    margin: 8px 0 0 0
    padding-left: 20px

    li
      margin-bottom: 4px
</style>