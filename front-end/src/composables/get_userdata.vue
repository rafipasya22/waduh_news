<script>
import { ref } from 'vue'

export function userdata() {
  const userData = ref({})
  async function getUserData() {
    try {
      const res = await fetch('/api/user', {
        credentials: 'include',
      })

      if (!res.ok) throw new Error('Failed to fetch session')

      const data = await res.json()
      if (data.logged_in) {
        userData.value = data.user || []
      } else {
        console.log('User not logged in')
        userData.value = []
      }
    } catch (err) {
      console.error('Error getting user info:', err)
      userData.value = []
    }
  }

  return {
    userData,
    getUserData
  }
}
</script>
