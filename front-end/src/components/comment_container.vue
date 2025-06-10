<script setup>
import { watch, ref } from 'vue'
import { defineEmits } from 'vue'

const props = defineProps({
  comment: Object,
  userEmail: String,
  postTitle: String,
  isLoggedin: Boolean,
})

const emit = defineEmits(['comment-removed'], ['notify'])

const likedcomment = ref([])
const dislikedcomment = ref([])
const total_comment_likes = ref(null)
const total_comment_dislikes = ref(null)

function comment_date(dateString) {
  const now = new Date()
  const commentDate = new Date(dateString)
  const seconds = Math.floor((now - commentDate) / 1000)

  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

async function removeComment(title, comment, commented_by) {
  const res = await fetch('/api/delete-comment', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ post_title: title, post_comments: comment }),
  })

  if (res.ok) {
    if (iscommliked(title, comment)) {
      try {
        unlikeComment(title, comment, commented_by)
      } catch (error) {
        console.log('ga di like')
      }
    }
    if (iscommdisliked(title, comment)) {
      try {
        removeCommentDislike(title, comment, commented_by)
      } catch (error) {
        console.log('ga di dislike')
      }
    }

    emit('comment-removed', comment)
  } else {
    throw new Error('Failed to delete comment')
  }
}

async function likeComment(title, comment, commented_by) {
  try {
    const res = await fetch('/api/like-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_title: title, comment: comment, commented_by: commented_by }),
    })

    if (!res.ok) throw new Error('failed to like comment')

    await checkcommentlikes(title, comment, commented_by)
    await totalcommentlikes(title, comment, commented_by)
  } catch (error) {
    console.error(err)
    alert('Error processing your request')
  }
}

async function unlikeComment(title, comment, commented_by) {
  try {
    const res = await fetch('/api/remove-comment-like', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_title: title, comment: comment, commented_by: commented_by }),
    })

    if (!res.ok) throw new Error('failed to like comment')

    await checkcommentlikes(title, comment, commented_by)
    await totalcommentlikes(title, comment, commented_by)
  } catch (error) {
    console.error(error)
    alert('Error processing your request')
  }
}

async function dislikeComment(title, comment, commented_by) {
  try {
    const res = await fetch('/api/dislike-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_title: title, comment: comment, commented_by: commented_by }),
    })

    if (!res.ok) throw new Error('failed to dislike comment')

    await checkcommentdislikes(title, comment, commented_by)
    await totalcommentdislikes(title, comment, commented_by)
  } catch (error) {
    console.error(err)
    alert('Error processing your request')
  }
}

async function removeCommentDislike(title, comment, commented_by) {
  try {
    const res = await fetch('/api/remove-comment-dislike', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_title: title, comment: comment, commented_by: commented_by }),
    })

    if (!res.ok) throw new Error('failed to like comment')

    await checkcommentdislikes(title, comment, commented_by)
    await totalcommentdislikes(title, comment, commented_by)
  } catch (error) {
    console.error(err)
    alert('Error processing your request')
  }
}

async function checkcommentlikes(title, comment, commented_by) {
  try {
    const res = await fetch('/api/check-likes-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_title: title, comment: comment, commented_by: commented_by }),
    })
    const data = await res.json()
    const like = data.comment_likes
    likedcomment.value = like ? [like] : []
  } catch (error) {
    console.error('Error fetching dislikes:', error)
    likedcomment.value = []
  }
}

async function totalcommentlikes(title, comment, commented_by) {
  try {
    const res = await fetch('/api/check-total-likes-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_title: title, comment: comment, commented_by: commented_by }),
    })
    const data = await res.json()
    total_comment_likes.value = data.total_comment_likes || 0
  } catch (error) {
    console.error('Error fetching dislikes:', error)
    total_comment_likes.value = 0
  }
}

async function checkcommentdislikes(title, comment, commented_by) {
  try {
    const res = await fetch('/api/check-dislikes-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_title: title, comment: comment, commented_by: commented_by }),
    })
    const data = await res.json()
    const dislike = data.comment_dislikes
    dislikedcomment.value = dislike ? [dislike] : []
  } catch (error) {
    console.error('Error fetching dislikes:', error)
    dislikedcomment.value = []
  }
}

async function totalcommentdislikes(title, comment, commented_by) {
  try {
    const res = await fetch('/api/check-total-dislikes-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_title: title, comment: comment, commented_by: commented_by }),
    })
    const data = await res.json()
    total_comment_dislikes.value = data.total_comment_dislikes || 0
  } catch (error) {
    console.error('Error fetching dislikes:', error)
    total_comment_dislikes.value = 0
  }
}

function iscommliked(title, comment) {
  return likedcomment.value.some((like) => like.post_title === title && like.comment === comment)
}

function iscommdisliked(title, comment) {
  return dislikedcomment.value.some(
    (dislike) => dislike.post_title === title && dislike.comment === comment,
  )
}

const handleLikeClick = async (title, comment, commented_by) => {
  if (props.isLoggedin == true) {
    try {
      if (iscommliked(title, comment)) {
        unlikeComment(title, comment, commented_by)
        emit('notify', { message: 'Comment unliked!', success: true })
      } else {
        likeComment(title, comment, commented_by)
        if (iscommdisliked(title, comment)) {
          removeCommentDislike(title, comment, commented_by)
        }
        emit('notify', { message: 'Comment liked!', success: true })
      }
    } catch (err) {
      console.error(err)
      emit('notify', { message: 'Cannot like comment, unexpected error', success: false })
    }
  } else {
    emit('notify', { message: 'Cannot like comment, please log in first!', success: false })
  }
}

const handleDisLikeClick = async (title, comment, commented_by) => {
  if (props.isLoggedin) {
    try {
      if (iscommdisliked(title, comment)) {
        removeCommentDislike(title, comment, commented_by)
        emit('notify', { message: 'Comment removed!', success: true })
      } else {
        dislikeComment(title, comment, commented_by)
        if (iscommliked(title, comment)) {
          unlikeComment(title, comment, commented_by)
        }
        emit('notify', { message: 'Comment disliked!', success: true })
      }
    } catch (err) {
      console.error(err)
      emit('notify', { message: err, success: false })
    }
  }else{
    emit('notify', { message: 'Cannot dislike comment, please log in first!', success: false })
  }
}

watch(
  () => props.comment,
  async (newComment) => {
    if (newComment) {
      await checkcommentlikes(props.postTitle, newComment.comment, newComment.commented_by)
      await totalcommentlikes(props.postTitle, newComment.comment, newComment.commented_by)
      await checkcommentdislikes(props.postTitle, newComment.comment, newComment.commented_by)
      await totalcommentdislikes(props.postTitle, newComment.comment, newComment.commented_by)
    }
  },
  { immediate: true, deep: true },
)
</script>

<template>
  <div class="comment d-flex justify-content-start align-items-start flex-row mt-3">
    <div class="comment-left me-3" style="width: fit-content">
      <img
        class="comment-image"
        :src="comment.user.profile_photo ? `${comment.user.profile_photo}` : '/profile/default.jpg'"
        alt=""
      />
    </div>

    <div
      class="comment-right d-flex justify-content-start align-items-start flex-column pb-3"
      style="width: 90%; border-bottom: solid 1px var(--grey)"
    >
      <div class="comment-top-right d-flex justify-content-start align-items-start flex-column">
        <div class="nameanddate d-flex justify-content-start align-items-center flex-row">
          <h5 class="name-comment">{{ comment.user.first_name }} {{ comment.user.last_name }}</h5>
          <small style="font-size: 0.3rem">
            <i class="fa-solid fa-circle"></i>
          </small>
          <small>{{ comment_date(comment.created_at) }}</small>
        </div>
        <p>{{ comment.comment }}</p>
      </div>

      <div
        class="comment-bottom-right d-flex justify-content-center align-items-center flex-row mt-3"
      >
        <small v-if="total_comment_likes > 0">
          <a
            @click.prevent="handleLikeClick(postTitle, comment.comment, comment.commented_by)"
            class="liked d-flex justify-content-center align-items-center flex-row"
            :class="{ pressed: iscommliked(postTitle, comment.comment) }"
            role="button"
          >
            <span class="material-symbols-outlined"> thumb_up </span>
            {{ total_comment_likes }} Likes
          </a>
        </small>

        <small v-else>
          <a
            @click.prevent="handleLikeClick(postTitle, comment.comment, comment.commented_by)"
            class="liked d-flex justify-content-center align-items-center flex-row"
            :class="{ pressed: iscommliked(postTitle, comment.comment) }"
            role="button"
          >
            <span class="material-symbols-outlined"> thumb_up </span>
            Like
          </a>
        </small>
        <small class="circle-comment mx-2" style="color: var(--grey)">
          <i class="fa-solid fa-circle"></i>
        </small>
        <small v-if="total_comment_dislikes > 0">
          <a
            class="disliked d-flex justify-content-center align-items-center flex-row"
            role="button"
            @click.prevent="handleDisLikeClick(postTitle, comment.comment, comment.commented_by)"
            :class="{ pressed: iscommdisliked(postTitle, comment.comment) }"
          >
            <span class="material-symbols-outlined"> thumb_down </span>
            {{ total_comment_dislikes }} Dislikes
          </a>
        </small>
        <small v-else>
          <a
            class="disliked d-flex justify-content-center align-items-center flex-row"
            role="button"
            @click.prevent="handleDisLikeClick(postTitle, comment.comment, comment.commented_by)"
            :class="{ pressed: iscommdisliked(postTitle, comment.comment) }"
          >
            <span class="material-symbols-outlined"> thumb_down </span>
            Dislike
          </a>
        </small>
        <small class="circle-comment mx-2" style="color: var(--grey)">
          <i class="fa-solid fa-circle"></i>
        </small>
        <small>
          <a
            class="report d-flex justify-content-center align-items-center flex-row"
            role="button"
            data-bs-toggle="modal"
            data-bs-target="#reportModal"
          >
            Report
          </a>
        </small>

        <small
          class="circle-comment mx-2"
          style="color: var(--grey)"
          v-if="comment.commented_by === userEmail"
        >
          <i class="fa-solid fa-circle"></i>
        </small>
        <small v-if="comment.commented_by === userEmail">
          <a
            class="deletecomment"
            @click="removeComment(postTitle, comment.comment, comment.commented_by)"
            role="button"
          >
            Delete
          </a>
        </small>
      </div>
    </div>
  </div>

  <div
    class="modal fade"
    id="reportModal"
    tabindex="-1"
    aria-labelledby="reportModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="reportModalLabel">
            Tell Us Why You've Reported This Comment!
          </h5>

          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div class="report-area">
            <textarea
              id="report"
              maxlength="200"
              placeholder="Write a report....."
              oninput="updateCharCount2()"
            ></textarea>
            <div class="report-footer mt-4">
              <div class="char-count"><b id="MaxChar">0</b> / 200</div>
              <button class="send-btn">
                Send Feedback <i class="fa-solid fa-paper-plane ms-2"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
