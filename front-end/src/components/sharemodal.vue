<script setup>
const props = defineProps({
  postData: Object,
})

function copyLink(event) {
  const btn = event.currentTarget
  const input_container = btn.closest('.input-group')
  const input = input_container.querySelector('#copyLinkInput').value
  navigator.clipboard.writeText(input)

  const msg_container = input_container.closest('.copy-link-container')
  const msg = msg_container.querySelector('.text-success')
  if (!msg) {
    console.log('gaada')
  } else {
    msg.classList.remove('d-none')
    setTimeout(() => {
      msg.classList.add('d-none')
    }, 3000)
  }
}

</script>

<template>
  <div
    class="modal fade"
    id="shareNewsModal"
    tabindex="-1"
    aria-labelledby="shareNewsModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header d-flex justify-content-between align-items-center">
          <h5 class="modal-title" id="shareNewsModalLabel">Share the news!</h5>

          <a type="button" class="closebtn" data-bs-dismiss="modal" aria-label="Close">
            <span class="material-symbols-outlined"> close </span>
          </a>
        </div>
        <div class="modal-body">
          <div class="d-flex justify-content-between align-items-start">
            <div class="d-flex justify-content-between align-items-start flex-column">
              <div class="facebook me-3 mb-3" style="width: 50%">
                <a
                  class="sharebtn btn d-flex justify-content-start align-items-center"
                  role="button"
                  data-bs-toggle="dropdown"
                  ><i class="fa-brands fa-facebook-f me-2"> </i>Facebook
                </a>
              </div>
              <div class="whatsapp me-3" style="width: 50%">
                <a
                  class="sharebtn btn d-flex justify-content-start align-items-center"
                  role="button"
                  data-bs-toggle="dropdown"
                  ><i class="fa-brands fa-whatsapp me-2"></i>WhatsApp
                </a>
              </div>
            </div>
            <div class="d-flex justify-content-between align-items-start flex-column">
              <div class="twitter" style="width: 50%">
                <a
                  class="sharebtn btn d-flex justify-content-start align-items-center mb-3"
                  role="button"
                  data-bs-toggle="dropdown"
                  ><i class="fa-brands fa-x-twitter me-2"></i>X
                </a>
              </div>
            </div>
          </div>
          <div class="copy-link-container mt-2">
            <label for="copyLinkInput" style="font-size: 0.9rem; color: var(--dark)">
              Or copy the link:
            </label>
            <div class="input-group">
              <input
                type="text"
                class="form-control"
                id="copyLinkInput"
                :value="postData?.url || postData?.source_url || ''"
                readonly
              />
              <button class="btn btn-outline-secondary" type="button" @click="copyLink">
                Copy
              </button>
            </div>
            <small id="copySuccess" class="text-success mt-2 d-none">Link copied!</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
