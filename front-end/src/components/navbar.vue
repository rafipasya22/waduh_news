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
      <div v-if="width >= 1000" class="acc-dropdown">
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
      <div v-else class="acc-dropdown">
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
      </div>
    </div>

    <!-- Offcanvas Desktop -->
    <div
      class="offcanvas offcanvas-top px-5"
      data-bs-scroll="true"
      tabindex="-1"
      id="sidebardesktop"
    >
      <div class="offcanvas-header d-flex align-items-center justify-content-between flex-row">
        <h5 class="offcanvas-title">More <span>Menu</span></h5>
        <a type="button" class="closebtn" data-bs-dismiss="offcanvas" aria-label="Close">
          <span style="font-size: 1.8rem" class="material-symbols-outlined"> close </span>
        </a>
      </div>
      <div class="offcanvas-body py-0 pb-4" style="height: fit-content !important">
        <table class="table mb-0" style="width: 100%">
          <tbody
            class="d-flex align-items-start justify-content-start flex-row"
            id="offcanvas-links"
          >
            <tr
              class="keyword-links d-flex align-items-start justify-content-start flex-column me-4"
            >
              <th>Route</th>
              <td>
                <router-link to="/"> Home </router-link>
              </td>
            </tr>

            <tr
              class="keyword-links d-flex align-items-start justify-content-start flex-column me-4"
            >
              <th>Profile</th>
              <td>
                <router-link to="/profile"> My Profile </router-link>
              </td>
              <td>
                <router-link to="/profile/bookmarks/seeall"> Bookmarks </router-link>
              </td>
            </tr>
            <tr
              class="keyword-links d-flex align-items-start justify-content-start flex-column me-4"
            >
              <th>Categories</th>
              <td class="d-flex justify-content-start flex-column gap-3">
                <div class="d-flex justify-content-start flex-row gap-4">
                  <router-link to="/news/category/sports" class="nav-link" aria-current="page"
                    >Sports</router-link
                  >
                  <router-link to="/news/category/technology" class="nav-link" aria-current="page"
                    >Technology</router-link
                  >
                  <router-link to="/news/category/health" class="nav-link" aria-current="page"
                    >Health</router-link
                  >
                </div>
                <div class="d-flex justify-content-start flex-row gap-4">
                  <router-link to="/news/category/science" class="nav-link" aria-current="page"
                    >Science</router-link
                  >
                  <router-link
                    to="/news/category/entertainment"
                    class="nav-link"
                    aria-current="page"
                    >Entertainment</router-link
                  >
                  <router-link to="/news/category/business" class="nav-link" aria-current="page"
                    >Business</router-link
                  >
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Offcanvas Mobile -->
    <div
      class="offcanvas offcanvas-start pt-2 px-3"
      data-bs-scroll="true"
      tabindex="-1"
      id="sidebarmobile"
    >
      <div class="offcanvas-header d-flex align-items-center justify-content-between flex-row">
        <h3>Side<span style="color: #dc0000d3; font-weight: 600">Menu</span></h3>
        <a type="button" class="closebtn" data-bs-dismiss="offcanvas" aria-label="Close">
          <span style="font-size: 1.6rem" class="material-symbols-outlined"> close </span>
        </a>
      </div>
      <div class="offcanvas-body d-flex justify-content-between align-items-start flex-column">
        <div class="sidebar-menu" style="width: 100%">
          <router-link
            to="/"
            class="sidemenu item d-flex justify-content-between align-items-center flex-row"
            >Home
          </router-link>
          <p class="d-inline-flex pb-2 my-2 gap-1" style="width: 100%">
            <a
              class="menucollapse"
              data-bs-toggle="collapse"
              href="#menucol_news"
              role="button"
              style="width: 100%; text-decoration: none"
              aria-expanded="false"
              aria-controls="menucol_news"
            >
              <div class="col-text d-flex justify-content-between flex-row align-items-center">
                <p style="margin: 0 !important">News Categories</p>
                <span class="material-symbols-outlined"> keyboard_arrow_down </span>
              </div>
            </a>
          </p>
          <div class="collapse mb-4" id="menucol_news">
            <div class="card card-body menucol px-3 pt-3">
              <router-link
                to="/news/category/sports"
                class="sidemenu item d-flex justify-content-between align-items-center flex-row my-2"
                >Sports
                <span class="material-symbols-outlined"> arrow_right </span>
              </router-link>
              <router-link
                to="/news/category/technology"
                class="sidemenu item d-flex justify-content-between align-items-center flex-row my-2"
                >Technology
                <span class="material-symbols-outlined"> arrow_right </span>
              </router-link>
              <router-link
                to="/news/category/science"
                class="sidemenu item d-flex justify-content-between align-items-center flex-row my-2"
                >Science
                <span class="material-symbols-outlined"> arrow_right </span>
              </router-link>
              <router-link
                to="/news/category/entertainment"
                class="sidemenu item d-flex justify-content-between align-items-center flex-row my-2"
                >Entertainment
                <span class="material-symbols-outlined"> arrow_right </span>
              </router-link>
              <router-link
                to="/news/category/business"
                class="sidemenu item d-flex justify-content-between align-items-center flex-row my-2"
                >Business
                <span class="material-symbols-outlined"> arrow_right </span>
              </router-link>
              <router-link
                to="/news/category/health"
                class="sidemenu item d-flex justify-content-between align-items-center flex-row my-2"
                >Health
                <span class="material-symbols-outlined"> arrow_right </span>
              </router-link>
            </div>
          </div>
          <p class="d-inline-flex pb-2 my-2 gap-1" :class="loggedIn ? `show` : `d-none`" style="width: 100%">
            <a
              class="menucollapse"
              data-bs-toggle="collapse"
              href="#menucol_profile"
              role="button"
              style="width: 100%; text-decoration: none"
              aria-expanded="false"
              aria-controls="menucol_profile"
            >
              <div class="col-text d-flex justify-content-between flex-row align-items-center">
                <p style="margin: 0 !important">Profile</p>
                <span class="material-symbols-outlined"> keyboard_arrow_down </span>
              </div>
            </a>
          </p>
          <div class="collapse mb-4" id="menucol_profile">
            <div class="card card-body menucol px-3 pt-3">
              <router-link
                to="/profile"
                class="sidemenu item d-flex justify-content-between align-items-center flex-row my-2"
                >My profile
                <span class="material-symbols-outlined"> arrow_right </span>
              </router-link>
              <router-link
                to="/profile/bookmarks/seeall"
                class="sidemenu item d-flex justify-content-between align-items-center flex-row my-2"
                >See Bookmarks
                <span class="material-symbols-outlined"> arrow_right </span>
              </router-link>
            </div>
          </div>
          <div
            class="search-sidebar d-flex justify-content-start align-items-start flex-column gap-2"
          >
            <p style="margin: 0 !important">Search News</p>
            <form
              id="container-search"
              class="input-search sidebar d-flex align-items-center expanded"
              @submit.prevent="onSearch"
            >
              <span id="icon-search" class="searchlogo material-symbols-outlined py-2 ps-2">
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
        </div>
        <div class="settingsandlogout" style="width: 100%">
          <div class="settingbtn my-2">
            <a
              class="settingbtn-sidebar"
              href="#"
              data-bs-toggle="modal"
              data-bs-target="#settingsModal"
            >
              Settings
            </a>
          </div>
          <a
            v-if="loggedIn"
            class="logout-sidebar d-flex justify-content-between align-items-center flex-row mt-3"
            style="width: 100%; text-decoration: none; cursor: pointer"
            @click.prevent="logout"
          >
            Log out
            <span class="material-symbols-outlined" style="color: var(--grey)"> logout </span>
          </a>
          <router-link
            v-else
            class="login-sidebar d-flex justify-content-between align-items-center flex-row mt-3"
            style="width: 100%; text-decoration: none; cursor: pointer"
            to="/auth"
          >
            Login / Signup
            <span class="material-symbols-outlined" style="color: var(--grey)"> login </span>
          </router-link>
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
        <div class="modal-header d-flex justify-content-between align-items-center flex-row">
          <h5 class="modal-title" id="settingsModalLabel">Settings</h5>

          <a type="button" class="closebtn" data-bs-dismiss="modal" aria-label="Close">
            <span class="material-symbols-outlined"> close </span>
          </a>
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
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps({
  loggedIn: Boolean,
  profilephoto: String,
})

const emit = defineEmits(['notify'])

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
let width = ref(window.innerWidth)

const ToggleTheme = () => {
  if (isDarkmode.value) {
    document.body.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.body.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

function updateSize() {
  width.value = window.innerWidth
}

function sidebar() {
  const btn = document.getElementById('sidebarbtn')
  if (!btn) {
    console.log('gaada')
  }
  console.log('btn ada')
  if (window.innerWidth < 1000) {
    btn.setAttribute('data-bs-target', '#sidebarmobile')
  } else {
    btn.setAttribute('data-bs-target', '#sidebardesktop')
  }
  console.log('target:', btn.getAttribute('data-bs-target'))
}

async function logout() {
  try {
    const res = await fetch('/api/logout')
    if (!res.ok) throw new Error('Logout Failed')
    emit('notify', { message: 'Logout Success!', success: true })
    await new Promise((resolve) => setTimeout(resolve, 3500))
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

watch(width, () => {
  sidebar()
})

onMounted(() => {
  window.addEventListener('resize', updateSize)
  sidebar()
  window.addEventListener('scroll', onScroll)
  window.addEventListener('mousemove', onMouseMove)
  document.addEventListener('click', handleClickOutside)

  isDarkmode.value = localStorage.getItem('theme') === 'dark'
  document.body.classList.toggle('dark', isDarkmode.value)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateSize)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('click', handleClickOutside)
})
</script>
