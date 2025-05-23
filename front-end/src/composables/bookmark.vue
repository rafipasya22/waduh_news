<script>
import { ref } from 'vue'

export function bookmarkpost() {
  const bookmarkedTitles = ref([])

  async function fetchBookmarks(titles) {
    const res = await fetch('/api/check-bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Titles: titles }),
    })
    const data = await res.json()
    bookmarkedTitles.value = data.bookmarked || []
  }

  async function toggleBookmark(post, onNotify) {
    const isBookmarked = bookmarkedTitles.value.includes(post.title)
    async function fetchArticleDetail(post) {
      const endpoint =
        post.sourceType === 'headline'
          ? `/api/ambil-news2/headline/${encodeURIComponent(post.category)}/${encodeURIComponent(post.title)}`
          : `/api/ambil-news2/general/${encodeURIComponent(post.title)}`

      const res = await fetch(endpoint)
      if (!res.ok) throw new Error('Gagal ambil artikel')
      const data = await res.json()
      return data.news?.find((item) => item.title === post.title)
    }
    try {
      const postData = await fetchArticleDetail(post)
      if (!postData) throw new Error('Data tidak ditemukan')

      const endpoint = isBookmarked ? '/api/remove-bookmark' : '/api/bookmark'
      const method = isBookmarked ? 'DELETE' : 'POST'

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isBookmarked
            ? { Title: post.title }
            : {
                Title: postData.title,
                Author: postData.author,
                Category: postData.category,
                Published_at: postData.published_at,
                Image_url: postData.image_url,
                Content: postData.content,
                Source_url: postData.source_url,
                Source_name: postData.source_name,
              },
        ),
      })

      if (!res.ok) throw new Error('Gagal ubah bookmark')

      if (isBookmarked) {
        bookmarkedTitles.value = bookmarkedTitles.value.filter((t) => t !== post.title)
        onNotify?.({ message: `Removed bookmark: "${post.title}"`, success: true })
      } else {
        bookmarkedTitles.value.push(post.title)
        onNotify?.({ message: `Bookmarked: "${post.title}"`, success: true })
      }
    } catch (err) {
      console.error('Gagal toggle bookmark:', err)
      onNotify?.({ message: 'Failed to bookmark post', success: false })
    }
  }

  return {
    bookmarkedTitles,
    fetchBookmarks,
    toggleBookmark,
  }
}
</script>
