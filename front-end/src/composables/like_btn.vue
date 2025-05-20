<script>
import { ref } from 'vue'

export function likepost() {
  const likedtitle = ref(null)
  const dislikedtitle = ref(null)

  async function fetchLikes(title) {
    try {
      const res = await fetch('/api/check-likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_title: title }),
      })
      const data = await res.json()
      likedtitle.value = data.likes || null
    } catch (error) {
      console.error('Error fetching likes:', error)
      likedtitle.value = []
    }
  }

  async function fetchDislikes(title) {
    try {
      const res = await fetch('/api/check-dislikes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_title: title }),
      })
      const data = await res.json()
      dislikedtitle.value = data.dislikes || null
    } catch (error) {
      console.error('Error fetching dislikes:', error)
      dislikedtitle.value = []
    }
  }

  function isPostLiked(title) {
    return likedtitle.value === title
  }

  function isPostDisliked(title) {
    return dislikedtitle.value === title
  }

  async function addLike(post) {
    const res = await fetch('/api/addlike', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    })

    if (res.ok) {
      if (likedtitle.value !== post.post_title) {
        likedtitle.value = post.post_title
      }
    } else {
      throw new Error('Failed to like post')
    }
  }

  async function add_Dislike(post) {
    const res = await fetch('/api/add-dislike', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    })

    if (res.ok) {
      if (dislikedtitle.value !== post.post_title) {
        dislikedtitle.value = post.post_title
      }
    } else {
      throw new Error('Failed to like post')
    }
  }

  async function removeLike(title) {
    const res = await fetch('/api/remove-like', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_title: title }),
    })

    if (res.ok) {
      likedtitle.value = null
    } else {
      throw new Error('Failed to unlike post')
    }
  }

  async function removeDislike(title) {
    const res = await fetch('/api/remove-dislike', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_title: title }),
    })

    if (res.ok) {
      dislikedtitle.value = null
    } else {
      throw new Error('Failed to unlike post')
    }
  }
  return {
    likedtitle,
    dislikedtitle,
    fetchLikes,
    fetchDislikes,
    isPostLiked,
    isPostDisliked,
    addLike,
    add_Dislike,
    removeLike,
    removeDislike,
  }
}
</script>
