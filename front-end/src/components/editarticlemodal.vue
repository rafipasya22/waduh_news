<script setup>
import { defineEmits, watch, ref } from 'vue'
const emit = defineEmits(['notify'])
const props = defineProps({
  postData: Object,
})

const previewSrc = ref('')
const post_title = ref('')
const old_title = ref('')
const post_category = ref('')
const post_content = ref('')
const fileInput = ref(null)

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

function updateCharCount() {
  const textarea = document.getElementById('newscontent')
  const remaining = 10000 - textarea.value.length
  document.getElementById('charRemaining').textContent = remaining
}

function resetCharCount() {
  const textarea = document.getElementById('newscontent')
  const remaining = 10000
  document.getElementById('charRemaining').textContent = remaining
}

async function handleEditArticle() {
  const formData = new FormData()

  const file = fileInput.value?.files[0]
  if (file) {
    formData.append('file', file)
  }

  formData.append('old_title', old_title.value)
  formData.append('post_title', post_title.value)
  formData.append('post_content', post_content.value)
  formData.append('post_category', post_category.value)

  try {
    const response = await fetch('/api/edit_article', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      emit('notify', { message: `Failed Edit Post: ${err}`, success: false })
    } else {
      emit('notify', { message: `Post Edited!`, success: true })
      await new Promise((resolve) => setTimeout(resolve, 3500))
      window.location.reload()
    }
  } catch (err) {
    emit('notify', { message: `Failed Edit Post: ${err}`, success: false })
  }
}

watch(
  () => props.postData,
  (newPost) => {
    if (newPost) {
      console.log('icjaw', newPost)
      old_title.value = newPost.title || ''
      previewSrc.value = newPost.imageUrl || newPost.image_url || ''
      post_title.value = newPost.title || ''
      post_category.value = newPost.category || ''
      post_content.value = newPost.content || ''
    }
  },
  { immediate: true },
)
</script>
<template>
  <div
    class="modal fade"
    id="editArticle"
    tabindex="-1"
    aria-labelledby="editArticleLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div
          class="modal-header d-flex justify-content-between align-items-center"
          style="padding-bottom: 0 !important"
        >
          <h3 class="modal-title" id="editArticleLabel">Edit Article</h3>

          <a type="button" class="closebtn" data-bs-dismiss="modal" aria-label="Close">
            <span class="material-symbols-outlined"> close </span>
          </a>
        </div>
        <div class="modal-body">
          <div class="editprofile-container">
            <form
              @submit.prevent="handleEditArticle"
              id="editarticle"
              enctype="multipart/form-data"
            >
              <input type="hidden" name="postid" v-model="postid" />
              <div class="d-flex justify-content-start gap-3 mb-3 flex-row">
                <img
                  id="preview-img"
                  class="article-image"
                  style="object-fit: cover"
                  :src="previewSrc"
                  alt="Profile Picture Preview"
                />
                <div class="d-flex align-items-start justify-content-start flex-column">
                  <h5 class="mb-3">Please Choose an Image for your article!</h5>
                  <input
                    type="file"
                    id="fileInput"
                    name="file"
                    accept="image/png, image/jpeg"
                    @change="previewImage"
                    ref="fileInput"
                  />
                  <p class="small text-muted mt-1" style="color: var(--grey) !important">
                    At least 800x800 px recommended.<br />JPG or PNG is allowed<br /><span
                      style="color: red !important"
                      >* </span
                    >Required
                  </p>
                </div>
              </div>

              <div class="d-flex justify-content-start align-items-start flex-row gap-2 mb-3">
                <div
                  class="articletitle d-flex justify-content-start align-items-start flex-column gap-2"
                  style="width: 65%"
                >
                  <h5 style="margin-bottom: 0 !important">
                    Title<span style="color: red">*</span>
                  </h5>
                  <input
                    v-model="post_title"
                    class="writetitle"
                    name="post_title"
                    placeholder="Write your Title Here!"
                    type="text"
                  />
                </div>

                <div
                  class="choosecat d-flex justify-content-start align-items-start flex-column gap-2"
                  style="width: 30%"
                >
                  <h5 style="margin-bottom: 0 !important">
                    Category<span style="color: red">*</span>
                  </h5>
                  <select name="post_category" v-model="post_category" class="selectcat" id="">
                    <option selected value="General">General</option>
                    <option value="Sports">Sports</option>
                    <option value="Science">Science</option>
                    <option value="Health">Health</option>
                    <option value="Business">Business</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Technology">Technology</option>
                  </select>
                </div>
              </div>

              <h5>News Content<span style="color: red">*</span></h5>
              <div class="d-flex align-items-center mb-3">
                <textarea
                  id="newscontent"
                  class="input-form me-3"
                  maxlength="10000"
                  rows="5"
                  v-model="post_content"
                  placeholder="Report your story....."
                  name="post_content"
                  @input="updateCharCount"
                ></textarea>
              </div>
              <div class="char-count"><b id="charRemaining">10000</b> Character Remaining</div>
            </form>
          </div>
        </div>
        <div
          class="modal-footer d-flex justify-content-end align-items-center flex-row"
          style="width: 100%"
        >
          <div class="d-flex justify-content-end flex-row">
            <button
              type="button"
              data-bs-dismiss="modal"
              aria-label="Close"
              class="btn btn-secondary me-2"
            >
              Cancel
            </button>
            <button type="submit" name="submit" form="editarticle" class="btn btn-save-changes">
              Post Article
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
