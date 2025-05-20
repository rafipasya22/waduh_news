<template>
  <div
    ref="navbar"
    class="navbar d-flex justify-content-between align-center"
    :class="{ hidden: isHiddenNavbar }"
  >
    <a href="#" data-bs-toggle="offcanvas" data-bs-target="#sidebardesktop" id="sidebarbtn">
      <span class="menu material-symbols-outlined">menu</span>
    </a>

    <router-link to="/" style="text-decoration: none">
      <h3>Waduh<span style="color: #dc0000d3; font-weight: 600">News</span></h3>
    </router-link>

    <div class="conttainer d-flex justify-content-evenly align-items-center flex-row">
      <div class="acc-dropdown">
        <a
          href="javascript:;"
          class="d-flex align-items-center"
          id="profileDropdown"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <img
            class="rounded-circle object-fit-cover"
            :src="
              loggedIn
                ? profilephoto
                  ? profilephoto
                  : '/profile/default.jpg'
                : '/profile/default.jpg'
            "
            width="40"
            height="40"
          />
          <span class="material-symbols-outlined">keyboard_arrow_down</span>
        </a>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
          <template v-if="loggedIn">
            <li><router-link to="/profile" class="dropdown-item">My Profile</router-link></li>
            <li>
              <a
                class="dropdown-item"
                href="#"
                data-bs-toggle="modal"
                data-bs-target="#settingsModal"
              >
                Settings
              </a>
            </li>
            <li>
              <a class="dropdown-item" @click.prevent="logout" style="cursor: pointer">Log out</a>
            </li>
          </template>
          <template v-else>
            <li><a class="dropdown-item" href="/auth">Log in</a></li>
            <li><a class="dropdown-item" href="/auth">Sign up</a></li>
          </template>
        </ul>
      </div>
    </div>

    <!-- Offcanvas Desktop -->
    <div class="offcanvas offcanvas-top px-5" tabindex="-1" id="sidebardesktop">
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">More <span>Categories</span></h5>
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>
      <div class="offcanvas-body py-0 pb-4" style="height: fit-content !important">
        <table class="table mb-0" style="width: 100%">
          <tbody
            class="d-flex align-items-start justify-content-start flex-row"
            id="offcanvas-links"
          >
            <tr
              v-for="(cat, index) in categories"
              :key="index"
              class="keyword-links d-flex align-items-start justify-content-start flex-column"
            >
              <th>{{ cat }}</th>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Offcanvas Mobile -->
    <div class="offcanvas offcanvas-start pt-2 px-3" tabindex="-1" id="sidebarmobile">
      <div class="offcanvas-header">
        <h3>Side<span style="color: #dc0000d3; font-weight: 600">Menu</span></h3>
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>
      <div class="offcanvas-body">
        <div>
          Some text as placeholder. In real life you can have the elements you have chosen. Like,
          text, images, lists, etc.
        </div>
        <div class="dropdown mt-3">
          <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
            Dropdown button
          </button>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="#">Action</a></li>
            <li><a class="dropdown-item" href="#">Another action</a></li>
            <li><a class="dropdown-item" href="#">Something else here</a></li>
          </ul>
        </div>
      </div>
    </div>
  </div>

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
                v-model="isDarkmode"
                @change="ToggleTheme"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div
    ref="wlr"
    class="wlr justify-content-between align-items-center flex-row"
    :class="{ hidden: isHiddenWlr, showed: isShowedWlr }"
  >
    <ul class="nav justify-content-start">
      <li class="nav-item">
        <router-link to="/news/category/sports" class="nav-link" aria-current="page"
          >Sports</router-link
        >
      </li>
      <li class="nav-item">
        <router-link to="/news/category/technology" class="nav-link" aria-current="page"
          >Technology</router-link
        >
      </li>
      <li class="nav-item">
        <router-link to="/news/category/health" class="nav-link" aria-current="page"
          >Health</router-link
        >
      </li>
      <li class="nav-item">
        <router-link to="/news/category/science" class="nav-link" aria-current="page"
          >Science</router-link
        >
      </li>
      <li class="nav-item">
        <router-link to="/news/category/entertainment" class="nav-link" aria-current="page"
          >Entertainment</router-link
        >
      </li>
      <li class="nav-item">
        <router-link to="/news/category/business" class="nav-link" aria-current="page"
          >Business</router-link
        >
      </li>
    </ul>
    <form
      id="container-search"
      :class="{ expanded: isSearchExpanded }"
      class="input-search d-flex align-items-center me-3"
      @submit.prevent="onSearch"
    >
      <span
        id="icon-search"
        class="searchlogo material-symbols-outlined py-2 ps-2"
        @click="expandSearch"
      >
        search
      </span>
      <input
        id="input-search"
        type="text"
        class="search ps-1 pe-3"
        placeholder="Search Posts..."
        aria-label="Search"
        v-model="searchQuery"
        ref="searchInput"
      />
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps({
  loggedIn: Boolean,
  profilephoto: String,
})

const categories = ref(['Sports', 'Technology', 'Health', 'Science', 'Entertainment', 'Business'])

const navbar = ref(null)
const wlr = ref(null)
const searchInput = ref(null)

const isHiddenNavbar = ref(false)
const isHiddenWlr = ref(false)
const isShowedWlr = ref(false)
const isSearchExpanded = ref(false)
const searchQuery = ref('')

const isDarkmode = ref(false)

const ToggleTheme = () => {
  if (isDarkmode.value) {
    document.body.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.body.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

async function logout() {
  try {
    const res = await fetch('/api/logout')
    if (!res.ok) throw new Error('Logout Failed')
    alert('Logout Success')
    await router.push('/auth')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

function profileLink() {
  return `/profile`
}

function onScroll() {
  if (window.scrollY < 100) {
    isHiddenNavbar.value = false
    isHiddenWlr.value = false
    isShowedWlr.value = false
  } else {
    isHiddenNavbar.value = true
    isHiddenWlr.value = true
    isShowedWlr.value = false
  }
}

function onMouseMove(e) {
  if (e.clientY <= 100 && window.scrollY >= 100) {
    isShowedWlr.value = true
  }
}

function expandSearch() {
  isSearchExpanded.value = true
  nextTick(() => {
    searchInput.value?.focus()
  })
}

function handleClickOutside(event) {
  if (wlr.value && !wlr.value.contains(event.target)) {
    isSearchExpanded.value = false
  }
}

function onSearch() {
  if (searchQuery.value.trim()) {
    router.push({ path: '/news/search', query: { q: searchQuery.value.trim() } })
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScroll)
  window.addEventListener('mousemove', onMouseMove)
  document.addEventListener('click', handleClickOutside)

  isDarkmode.value = localStorage.getItem('theme') === 'dark'
  document.body.classList.toggle('dark', isDarkmode.value)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('click', handleClickOutside)
})
</script>
