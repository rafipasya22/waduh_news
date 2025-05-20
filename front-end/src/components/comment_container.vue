<script setup>
const props = defineProps({
  comment: Object,
  userEmail: String,
  postTitle: String
})

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

async function removeComment(title, comment) {
  const res = await fetch('/api/delete-comment', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ post_title: title, post_comments: comment }),
  })

  if (res.ok) {
    alert("comment deleted")
    window.location.reload()
  } else {
    throw new Error('Failed to delete comment')
  }
}
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
        <small>
          <a class="liked d-flex justify-content-center align-items-center flex-row" role="button">
            <span class="material-symbols-outlined"> thumb_up </span>
            102 Likes
          </a>
        </small>
        <small class="circle-comment mx-2" style="color: var(--grey)">
          <i class="fa-solid fa-circle"></i>
        </small>
        <small>
          <a
            class="disliked d-flex justify-content-center align-items-center flex-row"
            role="button"
          >
            <span class="material-symbols-outlined"> thumb_down </span>
            25 Dislikes
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
          <a class="deletecomment" @click="removeComment(postTitle, comment.comment)" role="button"> Delete </a>
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
