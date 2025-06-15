<script setup>

function previewImage(event) {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = () => {
      previewSrc.value = reader.result
    }
    reader.readAsDataURL(file)
  }
}

async function handleUploadPhoto() {
  console.log('location input:', location.value)
  const formData = new FormData()

  const file = fileInput.value?.files[0]
  if (file) {
    formData.append('file', file)
  }

  formData.append('Location', location.value)
  console.log('formdata: ', formData.get('Location'))

  try {
    const response = await fetch('/api/edit', {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()

    if (!response.ok) {
      taskNoti({ message: result.message || 'Upload failed', success: false })
    } else {
      taskNoti({ message: result.message || 'Profile updated successfully', success: true })
      await new Promise((resolve) => setTimeout(resolve, 3500))
      window.location.reload()
    }
  } catch (err) {
    taskNoti({ message: err || 'Upload failed', success: false })
  }
}
</script>
<template>
  <div
    class="modal fade"
    id="WriteArticle"
    tabindex="-1"
    aria-labelledby="WriteArticleLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header d-flex justify-content-between align-items-center">
          <h5 class="modal-title" id="WriteArticleLabel">Write an Article</h5>

          <a type="button" class="closebtn" data-bs-dismiss="modal" aria-label="Close">
            <span class="material-symbols-outlined"> close </span>
          </a>
        </div>
        <div class="modal-body">
          <div class="editprofile-container">
            <form
              @submit.prevent="handleUploadPhoto"
              id="uploadphoto"
              enctype="multipart/form-data"
            >
              <div class="d-flex align-items-center mb-4">
                <div class="me-3">
                  <img
                    id="preview-img"
                    class="rounded-circle"
                    style="width: 100px; height: 100px; object-fit: cover"
                    :src="previewSrc"
                    alt="Profile Picture Preview"
                  />
                </div>

                <div class="container-editprofile">
                  <input
                    type="file"
                    id="fileInput"
                    name="file"
                    accept="image/png, image/jpeg"
                    @change="previewImage"
                    ref="fileInput"
                  />

                  <div
                    class="container-edit-bottom d-flex justify-content-between align-items-center flex-row"
                  >
                    <p class="small text-muted mt-1" style="color: var(--grey) !important">
                      At least 800x800 px recommended.<br />JPG or PNG is allowed
                    </p>
                    <button
                      type="button"
                      class="btn btn-save-changes ms-lg-auto"
                      data-bs-toggle="modal"
                      data-bs-target="#updatePasswordModal"
                    >
                      <i class="fas fa-pencil-alt me-1"></i> Change Password
                    </button>
                  </div>
                </div>
              </div>

              <h5>Location</h5>
              <div class="d-flex align-items-center mb-3">
                <textarea
                  v-model="location"
                  class="input-form me-3"
                  rows="5"
                  placeholder="e.g Bandung, Jawa Barat, Indonesia"
                  name="location"
                ></textarea>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
