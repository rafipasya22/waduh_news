<script setup>
import Post_mid from '@/components/post_mid.vue'
import Navbar from '@/components/navbar.vue'
import Footer from '@/components/footer.vue'
import Noti from '@/components/noti.vue'
import { bookmarkpost } from '@/composables/bookmark.vue'
import { analytics } from '@/composables/post_analytics.vue'
import { userdata } from '@/composables/get_userdata.vue'
import { useRoute } from 'vue-router'
import { ref, onMounted, computed } from 'vue'

const { getcomments, getlike, getUserInfo } = analytics()
const { bookmarkedTitles, fetchBookmarks, toggleBookmark } = bookmarkpost()
const { getUserData, userData } = userdata()

const isUserLoggedIn = ref(false)
const isSuccess = ref(false)
const taskMsg = ref(null)

const total_likes = ref(null)
const total_bookmarks = ref(null)
const bookmarkedPosts = ref([])
const form = ref({
  First_name: '',
  Last_name: '',
  email_new: '',
  Username: '',
})

const oldPass = ref('')
const newPass = ref('')
const confirmPass = ref('')
const errorMessage = ref('')

const previewSrc = ref('/static/Assets/ProfileImg/default.jpg')
const location = ref('')
const fileInput = ref(null)

async function get_total_likes() {
  try {
    const res = await fetch('/api/profile/get_total_likes')

    if (!res.ok) throw new Error('Failed to fetch session')

    const data = await res.json()
    if (data.total_likes_by) {
      total_likes.value = data.total_likes_by || 0
    } else {
      total_likes.value = 0
    }
  } catch (err) {
    console.error('Error getting user info:', err)
    total_likes.value = 0
  }
}

async function get_total_bookmarks() {
  try {
    const res = await fetch('/api/profile/get_total_bookmarks')

    if (!res.ok) throw new Error('Failed to fetch session')

    const data = await res.json()
    if (data.total_bookmarks_by) {
      total_bookmarks.value = data.total_bookmarks_by || 0
    } else {
      total_bookmarks.value = 0
    }
  } catch (err) {
    console.error('Error getting user info:', err)
    total_bookmarks.value = 0
  }
}

function capitalize(input) {
  if (!input) {
    return ''
  }
  return input.charAt(0).toUpperCase() + input.slice(1)
}

async function getBookmarkedPosts() {
  const res = await fetch('/api/user-bookmarks')
  const data = await res.json()
  if (data.bookmarks && data.bookmarks.length > 0) {
    const slicedNews = data.bookmarks.slice(0, 4)
    await getlike(slicedNews)
    await getcomments(slicedNews)
    return slicedNews.map((post) => ({ ...post }))
  }
  return []
}

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

async function handleSubmitPassword() {
  errorMessage.value = ''
  const formData = new FormData()
  formData.append('Old_pass', oldPass.value)
  formData.append('New_pass', newPass.value)
  formData.append('Confirm_pass', confirmPass.value)

  try {
    const response = await fetch('/api/edit/password', {
      method: 'POST',
      body: formData,
    })
    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.detail || 'An unknown error occurred'
    } else {
      alert('Password updated successfully!')
      oldPass.value = ''
      newPass.value = ''
      confirmPass.value = ''
    }
  } catch (error) {
    errorMessage.value = 'Network error, please try again.'
  }
}

async function handleUploadPhoto() {
  const formData = new FormData()

  const file = fileInput.value?.files[0]
  if (file) {
    formData.append('file', file)
  }

  formData.append('Location', location.value)

  try {
    const response = await fetch('/api/edit', {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()

    if (!response.ok) {
      taskMsg.value = result.message || 'Upload failed'
      isSuccess.value = false
      await taskNoti()
    } else {
      taskMsg.value = result.message || 'Profile updated successfully'
      isSuccess.value = true
      await taskNoti()
    }
    window.location.reload()
  } catch (err) {
    alert('An error occurred while uploading')
  }
}

const deletephoto = async () => {
  try {
    const response = await fetch('/api/delete-photo', {
      method: 'POST',
    })

    const result = await response.json()

    if (!response.ok) {
      taskMsg.value = result.message || 'Upload failed'
      isSuccess.value = false
      await taskNoti()
    } else {
      taskMsg.value = result.message || 'Profile updated successfully'
      isSuccess.value = true
      await taskNoti()
    }
    window.location.reload()
  } catch (err) {
    alert('An error occurred while uploading')
  }
}

const submitPersonalInfo = async () => {
  const formData = new FormData()
  for (const key in form.value) {
    formData.append(key, form.value[key])
  }

  try {
    const res = await fetch('/api/edit/personal-info', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) throw new Error('Failed to update personal info')

    const data = await res.json()

    console.log('Success:', data.message)
    taskMsg.value = data.message || 'Profile updated successfully'
    isSuccess.value = true
    await taskNoti()
    window.location.reload()
  } catch (err) {
    console.error('Error:', err)
    isSuccess.value = false
    await taskNoti()
  }
}

const taskNoti = () => {
  return new Promise((resolve) => {
    const noti = document.querySelector('.noti')
    noti.classList.add('show')

    setTimeout(() => {
      noti.classList.remove('show')
      setTimeout(() => {
        resolve()
      }, 300)
    }, 3000)
  })
}

onMounted(async () => {
  isUserLoggedIn.value = await getUserInfo()
  await getUserData()
  await get_total_likes()
  await get_total_bookmarks()
  bookmarkedPosts.value = await getBookmarkedPosts()
  form.value.First_name = userData.value.First_name || ''
  form.value.Last_name = userData.value.Last_name || ''
  form.value.email_new = userData.value.Email || ''
  form.value.Username = userData.value.Username || ''

  previewSrc.value = userData.value.ProfilePhoto || '/profile/default.jpg'

  const allTitles = [...bookmarkedPosts.value].map((p) => p.title)
  await fetchBookmarks(allTitles)

  console.log(userData.value)
})
</script>

<template>
  <Navbar :loggedIn="isUserLoggedIn" :profilephoto="userData.ProfilePhoto" />
  <div class="content mb-5 d-flex justify-content-between align-items-start flex-column">
    <div class="content-top d-flex justify-content-between align-items-end w-100">
      <div class="profile-container d-flex justify-content-start align-center flex-row p-3">
        <div class="profile-picture m-3">
          <img
            class="rounded-circle"
            :src="userData.ProfilePhoto ? `${userData.ProfilePhoto}` : '/profile/default.jpg'"
            alt="Profile Picture"
          />
        </div>
        <div class="profile-content d-flex justify-content-between flex-column">
          <div class="profile-sum">
            <div class="Acc-Name">
              <h2>{{ capitalize(userData.First_name) }} {{ capitalize(userData.Last_name) }}</h2>
            </div>
            <div class="Username">
              <small class="small">@{{ userData.Username }}</small>
            </div>
            <div class="joined">
              <small class="small">Joined Since {{ userData.Joined }}</small>
            </div>
            <div class="location d-flex justify-content-start align-items-center flex-row my-1">
              <span class="material-symbols-outlined text-muted">home_pin</span>
              <small class="text-muted">
                {{ userData.Location || 'Location Unknown' }}
              </small>
            </div>
            <div class="profile-analytics d-flex justify-content-start align-items-center flex-row">
              <div class="likes d-flex justify-content-start align-items-center flex-row me-2">
                <p class="like-numbers me-1 mb-0">{{ total_likes }}</p>
                <small class="small">Posts Liked</small>
              </div>
              <div
                class="bookmarked-posts d-flex justify-content-start align-items-center flex-row"
              >
                <p class="bookmark-numbers me-1 mb-0">{{ total_bookmarks }}</p>
                <small class="small">Posts Bookmarked</small>
              </div>
            </div>
          </div>
          <div class="edit-profile d-flex justify-content-end align-items-end">
            <a
              href="#"
              data-bs-toggle="modal"
              data-bs-target="#profilemodal"
              class="btn edit-profile-btn"
            >
              Edit Profile
            </a>
          </div>
        </div>
      </div>

      <div
        class="preferences-container ms-2 d-flex justify-content-start align-items-center flex-column"
      >
        <div class="top-container d-flex justify-content-between align-items-center flex-row mb-3">
          <div class="title d-flex flex-column align-items-start justify-content-evenly">
            <h5>Followed</h5>
            <h5>Topics</h5>
          </div>
          <div class="editbtn">
            <a
              href="#"
              data-bs-toggle="modal"
              data-bs-target="#prefmodal"
              class="d-flex align-items-center"
            >
              <span class="material-symbols-outlined">edit_square</span>
              <p>Edit</p>
            </a>
          </div>
        </div>
        <div class="bottom-container d-flex flex-column pb-2 mb-4">
          <div class="cat-container justify-content-center align-items-center top d-flex flex-row">
            <div
              v-for="topic in preferredTopics.slice(0, 3)"
              :key="topic"
              class="news-cat d-flex justify-content-center align-items-center mx-2 my-2"
              :class="topic.replace(/\s+/g, '-')"
            >
              <p class="px-1">{{ topic }}</p>
            </div>
            <p v-if="preferredTopics.length === 0" class="text-muted mx-2 my-4">
              No Topic Has Been Selected
            </p>
          </div>
          <div
            class="cat-container justify-content-center align-items-center bottom d-flex flex-row"
          >
            <div
              v-for="topic in preferredTopics.slice(3, 6)"
              :key="topic"
              class="news-cat d-flex justify-content-center align-items-center mx-2 my-2"
              :class="topic.replace(/\s+/g, '-')"
            >
              <p class="px-1">{{ topic }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="bookmarked-top d-flex justify-content-between align-items-center flex-row mt-4 w-100"
    >
      <div class="bookmarked-posts-title">
        <h3>Bookmarked <span>Posts</span></h3>
      </div>
      <router-link to="/profile/bookmarks/seeall" class="seeall">See all</router-link>
    </div>

    <div class="bookmarked-posts-profile d-flex flex-row mt-2">
      <Post_mid
        v-for="(post, index) in bookmarkedPosts.slice(0, 2)"
        :key="index"
        :post="post"
        :bookmarked="bookmarkedTitles.includes(post.title)"
        @toggleBookmark="() => toggleBookmark(post)"
      />
    </div>
    <div class="bookmarked-posts-profile d-flex flex-row mt-2">
      <Post_mid
        v-for="(post, index) in bookmarkedPosts.slice(2, 4)"
        :key="index"
        :post="post"
        :bookmarked="bookmarkedTitles.includes(post.title)"
        @toggleBookmark="() => toggleBookmark(post)"
      />
    </div>
  </div>

  <Noti :taskStatus="isSuccess" :taskMsg="taskMsg" />

  <div
    class="modal fade"
    id="settingsModal"
    tabindex="-1"
    aria-labelledby="settingsModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="settingsModalLabel">Settings</h5>

          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div class="switch d-flex align-items-center justify-content-between flex-row">
            <p style="margin-bottom: 0 !important">Dark Mode</p>
            <div class="form-check form-switch">
              <input
                class="form-check-input custom-switch"
                type="checkbox"
                role="switch"
                id="theme-toggle"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div
    class="modal fade"
    id="prefmodal"
    tabindex="-1"
    aria-labelledby="prefmodallabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title" id="prefmodallabel"><span>Edit</span> Preferences</h2>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div class="edit-prefs">
            <div
              class="available-topics d-flex justify-content-start align-items-start flex-column mb-5"
            >
              <h5>Available Topics</h5>
              <div
                class="categories-edit d-flex justify-content-start align-items-start flex-row"
                id="available-topics"
              >
                <div
                  v-for="topic in availableTopics"
                  :key="topic"
                  class="news-cat d-flex justify-content-between align-items-center mx-2 my-2"
                  :class="topic.replace(/\s+/g, '-')"
                  :data-topic="topic"
                >
                  <div class="cat-text">
                    <p class="px-1">{{ topic }}</p>
                  </div>
                  <div class="cat-btn">
                    <a href="#" @click.prevent="toggleTopic(topic)">
                      <span class="material-symbols-outlined"> add </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="preferred-topics d-flex justify-content-start align-items-start flex-column mt-5 mb-4"
            >
              <h5>Preferred Topics</h5>
              <div
                class="pref-edit d-flex justify-content-start align-items-start flex-row"
                id="preferred-topics"
              >
                <div
                  v-for="topic in preferredTopics"
                  :key="topic"
                  class="news-cat d-flex justify-content-between align-items-center mx-2 my-2"
                  :class="topic.replace(/\s+/g, '-')"
                  :data-topic="topic"
                >
                  <div class="cat-text">
                    <p class="px-1">{{ topic }}</p>
                  </div>
                  <div class="cat-btn">
                    <a href="#" @click.prevent="toggleTopic(topic)">
                      <span class="material-symbols-outlined" style="transform: rotate(45deg)">
                        add
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            @click="savePreferences"
            class="btn btn-save-changes"
            data-bs-dismiss="modal"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>

  <div
    class="modal fade"
    id="editModal"
    tabindex="-1"
    aria-labelledby="editModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="editModalLabel">Edit Personal Info</h5>
          <button
            id="editpersonal"
            type="button"
            class="btn-close"
            data-bs-toggle="modal"
            data-bs-target="#profilemodal"
          ></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitPersonalInfo">
            <div class="mb-3">
              <label for="First_name" class="form-label">First Name</label>
              <input type="text" class="input-form" id="First_name" v-model="form.First_name" />
            </div>

            <div class="mb-3">
              <label for="Last_name" class="form-label">Last Name</label>
              <input type="text" class="input-form" id="Last_name" v-model="form.Last_name" />
            </div>

            <div class="mb-3">
              <label for="Username" class="form-label">Username</label>
              <input type="text" class="input-form" id="Username" v-model="form.Username" />
            </div>

            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-toggle="modal"
                data-bs-target="#profilemodal"
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-save-changes">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <div
    class="modal fade"
    id="updatePasswordModal"
    tabindex="-1"
    aria-labelledby="updatePasswordModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="updatePasswordModalLabel">Update Password</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-toggle="modal"
            data-bs-target="#profilemodal"
          ></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmitPassword" id="passform">
            <div class="mb-3">
              <label for="oldPassword" class="form-label">Old Password</label>
              <input
                v-model="oldPass"
                type="password"
                class="input-form"
                id="oldPassword"
                required
              />
            </div>
            <div class="mb-3">
              <label for="newPassword" class="form-label">New Password</label>
              <input
                v-model="newPass"
                type="password"
                class="input-form"
                id="newPassword"
                required
              />
            </div>
            <div class="mb-3">
              <label for="confirmNewPassword" class="form-label">Confirm New Password</label>
              <input
                v-model="confirmPass"
                type="password"
                class="input-form"
                id="confirmNewPassword"
                required
              />
              <div v-if="errorMessage" style="color: red; margin-top: 1rem; font-size: 15px">
                {{ errorMessage }}
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-toggle="modal"
                data-bs-target="#profilemodal"
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-save-changes">Update Password</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <div
    class="modal fade"
    id="profilemodal"
    tabindex="-1"
    aria-labelledby="profilemodallabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title" id="profilemodallabel"><span>Edit</span> Profile</h2>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
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

              <h5>Personal Info</h5>
              <div
                class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3"
              >
                <div>
                  <p class="mb-1">
                    <strong>Full Name</strong>: {{ userData.First_name }} {{ userData.Last_name }}
                  </p>
                  <p class="mb-1"><strong>Email</strong>: {{ userData.Email }}</p>
                  <p class="mb-1"><strong>Username</strong>: @{{ userData.Username }}</p>
                </div>
                <div class="edit-profile d-flex justify-content-end align-items-end">
                  <a
                    href="#"
                    data-bs-toggle="modal"
                    data-bs-target="#editModal"
                    class="btn edit-profile-btn"
                  >
                    Edit Personal Info
                  </a>
                </div>
              </div>

              <h5>Location</h5>
              <div class="d-flex align-items-center mb-3">
                <textarea
                  v-model="location"
                  class="input-form me-3"
                  rows="5"
                  placeholder="e.g Bandung, Jawa Barat, Indonesia"
                  name="Location"
                ></textarea>
              </div>
            </form>
          </div>
        </div>
        <div
          class="modal-footer d-flex justify-content-between align-items-center flex-row"
          style="width: 100%"
        >
          <form @submit.prevent="deletephoto" method="post">
            <button type="submit" class="btn btn-danger btn-sm" name="delete_photo">
              Delete Profile Photo
            </button>
          </form>
          <div class="d-flex justify-content-end flex-row">
            <button
              type="button"
              data-bs-dismiss="modal"
              aria-label="Close"
              class="btn btn-secondary me-2"
            >
              Cancel
            </button>
            <button type="submit" name="submit" form="uploadphoto" class="btn btn-save-changes">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script>
export default {
  name: 'UserProfileBookmarks',
  data() {
    return {
      allTopics: ['Sports', 'Science', 'Technology', 'Health', 'Business', 'Entertainment'],
      preferredTopics: [],
      user: {
        ProfilePhoto: null,
        First_name: 'John',
        Last_name: 'Doe',
        Username: 'johndoe',
        Joined: 'January 2023',
        Location: null,
      },
      bookmarkedPosts: [
        {
          image: null,
          link: '#',
          category: '',
          title: '',
          views: '1.3K',
          shares: '1.3K',
          likes: 'Loading',
          bookmarked: true,
        },
        {
          image: null,
          link: '#',
          category: '',
          title: '',
          views: '1.3K',
          shares: '1.3K',
          likes: 'Loading',
          bookmarked: true,
        },
      ],
    }
  },
  computed: {
    availableTopics() {
      return this.allTopics.filter((topic) => !this.preferredTopics.includes(topic))
    },
    topTopics() {
      const shuffled = [...this.preferredTopics]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled.slice(0, 3)
    },
    bottomTopics() {
      const shuffled = [...this.preferredTopics]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled.slice(3, 6)
    },
  },
  mounted() {
    fetch('/api/user-preferences')
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          this.preferredTopics = data.preferred_topics || []
        }
      })
      .catch((err) => console.error('Error fetching user preferences:', err))
  },
  methods: {
    toggleTopic(topic) {
      const index = this.preferredTopics.indexOf(topic)
      if (index > -1) {
        this.preferredTopics.splice(index, 1)
        fetch(`/api/remove-preference/${encodeURIComponent(topic)}`, {
          method: 'DELETE',
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              console.error(data.error)
            } else {
              console.log(`Topic ${topic} removed successfully.`)
            }
          })
          .catch((error) => {
            console.error('Error removing topic:', error)
          })
      } else {
        this.preferredTopics.push(topic)
      }
    },
    savePreferences() {
      fetch('/api/save-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topics: this.preferredTopics }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Saving Preferences Failed')
          return res.json()
        })
        .then((data) => {
          console.log('Preferences Saved:', data)
          location.reload()
        })
        .catch((err) => console.error(err))
    },
  },
}
</script>
