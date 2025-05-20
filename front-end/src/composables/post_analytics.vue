<script>
export function analytics() {
  async function getUserInfo() {
    try {
      const res = await fetch('/api/session', {
        credentials: 'include',
      })

      if (!res.ok) throw new Error('Failed to fetch session')

      const data = await res.json()
      if (data.logged_in) {
        console.log('Logged in as:', data.user.first_name)
        return true
      } else {
        console.log('User not logged in')
        return false
      }
    } catch (err) {
      console.error('Error getting user info:', err)
      return false
    }
  }

  async function getlike(posts) {
    for (const post of posts) {
      try {
        const res = await fetch('/api/total_likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ post_title: post.title }),
        })
        const data = await res.json()
        post.total_likes = data.total_likes || 0
      } catch (e) {
        console.error('Failed to fetch likes', e)
        post.total_likes = 0
      }
    }
  }

  async function getcomments(posts) {
    for (const post of posts) {
      try {
        const res = await fetch('/api/total_comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ post_title: post.title }),
        })
        const data = await res.json()
        post.total_comments = data.total_comments || 0
      } catch (e) {
        console.error('Failed to fetch comments', e)
        post.total_comments = 0
      }
    }
  }

  return{
    getUserInfo,
    getlike,
    getcomments
  }
}
</script>
