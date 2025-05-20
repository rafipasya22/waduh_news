<template>
  <div class="auth-wrapper">
    <div class="container" :class="{ active: isSignUp }" id="container">
      <div class="form-container sign-up">
        <div class="container-signup">
          <h1>Sign <span class="UP">Up</span></h1>
        </div>
        <form @submit.prevent="submitSignUp" id="formsignup">
          <div class="NamesForm">
            <div class="FirstName">
              <h3>First Name</h3>
              <input type="text" v-model="signup.First_name" placeholder="First Name" required />
            </div>
            <div class="LastName">
              <h3>Last Name</h3>
              <input type="text" v-model="signup.Last_name" placeholder="Last Name" required />
            </div>
          </div>
          <div class="EmailForm">
            <h3>Email Address</h3>
          </div>
          <input type="email" v-model="signup.Email" placeholder="Email" required />

          <div class="UserName">
            <h3>Create Username</h3>
          </div>
          <input type="text" v-model="signup.Username" placeholder="Username" required />

          <div class="PassForm">
            <div class="Enter">
              <h3>Enter Password</h3>
              <input
                type="password"
                v-model="signup.Password"
                placeholder="Enter Password"
                minlength="8"
                required
              />
            </div>
            <div class="Confirm">
              <h3>Re-enter Password</h3>
              <input
                type="password"
                v-model="signup.Confirm_Password"
                placeholder="Confirm Password"
                minlength="8"
                required
              />
            </div>
          </div>

          <button type="submit" class="button signup">Sign <span class="UP">Up</span></button>
          <div v-if="signupError" class="msg-error">{{ signupError }}</div>
        </form>

        <div class="btn-center">
          <p>Already Have an Account?</p>
          <button class="Sgin-in" @click="isSignUp = false">Sign In</button>
        </div>

        <div class="Login-gulugulu">
          <div class="divider2">
            <hr />
            <h4>Or</h4>
            <hr />
          </div>
          <a href="/auth/google" class="btn-gulugulu">
            <img src="/image-assets/Google_logo.webp" alt="" />
            <h4>Continue With <span id="Google">Google</span></h4>
          </a>
        </div>
      </div>

      <div class="form-container sign-in">
        <div class="container-signin">
          <h1>Sign <span class="IN">In</span></h1>
        </div>
        <form @submit.prevent="submitLogin" id="formsignin">
          <div class="EmailForm"><h3>Email Address</h3></div>
          <input type="email" v-model="signin.Email" placeholder="Email" required />

          <div class="PassForm"><h3>Password</h3></div>
          <input type="password" v-model="signin.Password" placeholder="Password" required />

          <button type="submit" class="button">Sign <span class="IN">In</span></button>
        </form>

        <div class="btn-center">
          <p>Don't Have an Account?</p>
          <button class="Sgin-up" @click="isSignUp = true">Sign Up</button>
        </div>

        <div class="Login-gulugulu">
          <div class="divider2">
            <hr />
            <h4>Or</h4>
            <hr />
          </div>
          <a href="/auth/google" class="btn-gulugulu">
            <img src="/image-assets/Google_logo.webp" alt="" />
            <h4>Continue With <span id="Google">Google</span></h4>
          </a>
        </div>
      </div>

      <div class="toggle-container">
        <div class="toggle" :class="{ active: isSignUp }" id="tooogle">
          <div class="toggle-panel toggle-left">
            <div class="container-baru">
              <div class="divider">
                <div class="text-big-right">
                  <h1>Stay Informed, Stay Ahead—Bringing You the News That Matters.</h1>
                </div>
                <div class="text-mid-right">
                  <p>Welcome, Sign Up to Access the Website Full Feature</p>
                </div>
              </div>
              <div class="btn-right">
                <p style="text-align: right; color: white; margin-bottom: 0.5rem">
                  Already Have an Account?
                </p>
                <button class="Sgin-in" @click="isSignUp = false">Sign In</button>
              </div>
            </div>
          </div>
          <div class="toggle-panel toggle-right">
            <div class="container-baru">
              <div class="divider">
                <div class="text-big-left">
                  <h1>Stay Informed, Stay Ahead—Bringing You the News That Matters.</h1>
                </div>
                <div class="text-mid-left">
                  <p>Welcome, Sign In to Access the Website Full Feature</p>
                </div>
              </div>
              <div class="btn-left">
                <p style="text-align: left; color: white; margin-bottom: 0.5rem">
                  Don't Have an Account?
                </p>
                <button class="Sgin-up" @click="isSignUp = true">Sign Up</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthPage',
  props: {
    prefill: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      isSignUp: false,
      signupError: '',
      signup: {
        First_name: this.prefill.first_name || '',
        Last_name: this.prefill.last_name || '',
        Email: this.prefill.email || '',
        Username: '',
        Password: '',
        Confirm_Password: '',
      },
      signin: {
        Email: '',
        Password: '',
      },
      loginError: '',
    }
  },
  mounted() {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) this.isSignUp = true
  },
  methods: {
    async submitSignUp() {
      if (this.signup.Password !== this.signup.Confirm_Password) {
        this.signupError = 'Passwords do not match'
        return
      }

      const formData = new FormData()
      for (const key in this.signup) {
        if (key !== 'confirmPassword') {
          formData.append(key, this.signup[key])
        }
      }

      console.log(formData)

      const response = await fetch('/api/signup', {
        method: 'POST',
        body: formData,
      })

      let data = {}

      try {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          data = await response.json()
        } else {
          const text = await response.text()
          console.error('Non-JSON response:', text)
          data = { detail: text }
        }
      } catch (e) {
        console.error('Failed to parse JSON:', e)
        data = { detail: 'Invalid server response' }
      }

      if (!response.ok) {
        this.signupError = data.detail || 'An unknown error occurred'
      } else {
        alert('Account created successfully!')
        this.resetForm()
      }
    },
    async submitLogin() {
      const formData = new FormData()
      formData.append('Email', this.signin.Email)
      formData.append('Password', this.signin.Password)

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        })

        const data = await response.json()

        if (!response.ok) {
          console.error(data.detail || 'Login failed')
          this.loginError = data.detail || 'Login failed'
        } else {
          alert('Login successful!')
          this.$router.push('/')
        }
      } catch (err) {
        console.error('Login error:', err)
        this.loginError = 'Something went wrong.'
      }
    },
    resetForm() {
      this.signup = {
        First_name: '',
        Last_name: '',
        Email: '',
        Username: '',
        Password: '',
        Confirm_Password: '',
      }
      this.signupError = ''
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Quicksand', sans-serif;
}

.auth-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #d4d4d4;
  padding: 2rem;
}

.rember {
  font-family: 'Quicksand', 'sans-serif';
}

.rember a {
  color: white;
  text-decoration: none;
  transition: all 1000ms ease;
  cursor: pointer;
}

.rember a:hover {
  text-decoration: underline;
  scale: 106%;
  color: #38b6ff;
}

.container {
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.35);
  position: relative;
  overflow: hidden;
  width: 80%;
  max-width: 100%;
  min-height: 80%;
}

.container p {
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.3px;
  margin: 20px 0;
}

.text-mid-left {
  width: 100%;
}

.text-big-left h1 {
  font-size: 2em;
  font-weight: 800;
}

.text-mid-right {
  width: 100%;
}

.text-big-right h1 {
  font-size: 2em;
  font-weight: 800;
}

.container span {
  font-size: 12px;
}

.container a {
  color: #333;
  font-size: 13px;
  text-decoration: none;
  margin: 15px 0 10px;
}

.container button {
  background-color: #dc0000d3;
  color: #fff;
  font-size: 12px;
  padding: 10px 45px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 300ms ease;
}

.container .button {
  margin-top: 3rem;
  margin-bottom: 2rem;
}

.container .button.signup {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.button {
  width: 75%;
}

.Login-gulugulu {
  width: 70%;
  padding: 0 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.btn-gulugulu {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  margin-top: 1rem;
  border: solid 1px #ba0000e4;
  color: black;
  border-radius: 5px;
  cursor: pointer;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.2rem;
  padding-bottom: 0.2rem;
  transition: all 0.3s;
}

.btn-gulugulu:hover {
  background-color: #dc0000d3;
  color: white;
}

.btn-gulugulu h4 {
  font-size: 10px;
  font-weight: normal;
}

#Google {
  font-size: 10px;
  font-weight: bold;
}

.btn-gulugulu img {
  width: 20px;
  height: 20px;
}

.divider2 {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  width: 100%;
}

.divider2 h4 {
  margin-left: 1rem;
  margin-right: 1rem;
  font-size: 1rem;
}

.divider2 hr {
  width: 100%;
}

form button:hover {
  background-color: #b50000d3;
}

.container button.hidden {
  color: #f75f00;
  background-color: white;
}

.container button.hidden:hover {
  border-color: #f75f00;
  background-color: #38b6ff;
  border-color: #38b6ff;
  color: #fff;
  font-weight: 800;
}

.container form {
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 40px;
  width: 100%;
}

#tooogle {
  background-image: url('/image-assets/BG_Login.png') !important;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.container-signin {
  margin-bottom: 1rem;
}

.container-signin h1 {
  font-size: 2.5rem;
  font-weight: normal;
}

.container-signin .IN {
  font-size: 2.5rem;
  font-weight: bolder;
}

.container-signup {
  margin-bottom: 1rem;
}

.container-signup h1 {
  font-size: 2.5rem;
  font-weight: normal;
}

.container-signup .UP {
  font-size: 2.5rem;
  font-weight: bolder;
}

input {
  background-color: #eee;
  border: none;
  margin: 8px 0;
  padding: 10px 15px;
  font-size: 13px;
  border-radius: 8px;
  width: 75%;
  outline: none;
}

form.signup p {
  margin-top: 0;
  margin-bottom: 0;
  text-align: left;
}

.container select {
  background-color: #eee;
  border: none;
  margin: 8px 0;
  padding: 10px 15px;
  font-size: 13px;
  border-radius: 8px;
  width: 100%;
  outline: none;
}

.form-container {
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.sign-in {
  left: 40%;
  width: 60%;
  z-index: 2;
}

.container.active .sign-in {
  transform: translateX(-150%);
}

#formsignin {
  margin-top: 2rem;
}

.sign-up {
  left: 40%;
  width: 60%;
  opacity: 0;
  z-index: 1;
}

.container.active .sign-up {
  transform: translateX(-66.5%);
  opacity: 1;
  z-index: 5;
  animation: move 0.6s;
}

@keyframes move {
  0%,
  49.99% {
    opacity: 0;
    z-index: 1;
  }
  50%,
  100% {
    opacity: 1;
    z-index: 5;
  }
}

.social-icons {
  margin: 20px 0;
}

.social-icons a {
  border: 1px solid #ccc;
  border-radius: 20%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin: 0 3px;
  width: 40px;
  height: 40px;
}

.toggle-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 40%;
  height: 100%;
  overflow: hidden;
  transition: all 0.6s ease-in-out;

  z-index: 1000;
}

.container.active .toggle-container {
  transform: translateX(150%);
}

.toggle {
  background-color: #ffffff;
  height: 100%;
  background: #ffffff;
  color: #000000;
  position: relative;
  left: 0;
  height: 100%;
  width: 100%;
  transform: translateX(0);
  transition: all 0.6s ease-in-out;
}

.toggle.active {
  background-color: #ffffff;
  height: 100%;
  background: #ffffff;
  color: #000000;
  position: relative;
  left: -50%;
  height: 100%;
  width: 100%;
  transform: translateX(0);
  transition: all 0.6s ease-in-out;
}

.container.active .toggle {
  transform: translateX(50%);
}

.toggle-panel {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 30px;
  text-align: center;
  top: 0;
  transform: translateX(0);
  transition: all 0.6s ease-in-out;
}

.container-baru {
  background-color: #9a9a9a7f;
  backdrop-filter: blur(4px);
  height: 100%;
  width: 100%;
  margin: 5%;
  padding: 5%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  border-radius: 20px;
}

.divider {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100%;
}

.text-big-right {
  text-align: right;
  color: white;
}
.text-big-left {
  text-align: left;
  color: white;
}

.Sgin-in {
  background-color: transparent !important;
  color: #fff;
  font-size: 12px;
  padding: 0 !important;
  border: none !important;
  border-radius: 8px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 300ms ease;
  text-decoration: underline;
}

.Sgin-in:hover {
  font-weight: bolder;
  color: #dc0000d3;
}

.EmailForm {
  display: flex;
  align-items: start;
  width: 75%;
}

.EmailForm h3 {
  font-weight: 600;
  font-size: 15px;
}

.PassForm {
  width: 75%;
  display: flex;
  justify-content: left;
  align-items: start;
  flex-direction: row;
}

.PassForm h3 {
  font-weight: 600;
  font-size: 15px;
}

.Sgin-up {
  background-color: transparent !important;
  color: #fff;
  font-size: 12px;
  padding: 0 !important;
  border: none !important;
  border-radius: 8px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 300ms ease;
  text-decoration: underline;
}

.Sgin-up:hover {
  font-weight: bolder;
  color: #dc0000d3;
}

.text-mid-right p {
  text-align: right;
  color: white;
  font-weight: 500;
}

.text-mid-left p {
  text-align: left;
  color: white;
  font-weight: 500;
}

.btn-right {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: end;
  flex-direction: column;
}

.btn-left {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: start;
  flex-direction: column;
}

.toggle-left {
  transform: translateX(-200%);
}

.container.active .toggle-left {
  transform: translateX(0);
}

.toggle-right {
  right: 0;
  transform: translateX(0);
}

.container.active .toggle-right {
  transform: translateX(200%);
}

.NamesForm {
  width: 75%;
  display: flex;
  justify-content: left;
  align-items: start;
  flex-direction: row;
}

.FirstName {
  width: 50%;
}

.LastName {
  width: 50%;
}

.UserName {
  width: 75%;
  display: flex;
  justify-content: left;
  align-items: start;
  flex-direction: row;
}

.UserName h3 {
  font-weight: 600;
  font-size: 15px;
}

.FirstName {
  margin-right: 1rem;
}

.FirstName h3 {
  font-weight: 600;
  font-size: 15px;
}

.LastName h3 {
  font-weight: 600;
  font-size: 15px;
}

.FirstName input {
  width: 100% !important;
}

.LastName input {
  width: 100% !important;
}

.Enter {
  margin-right: 1rem;
  width: 50%;
}

.Confirm {
  width: 50%;
}

.Enter h3 {
  font-weight: 600;
  font-size: 15px;
}

.Confirm h3 {
  font-weight: 600;
  font-size: 15px;
}

.Enter input {
  width: 100%;
}

.Confirm input {
  width: 100%;
}

.btn-center {
  display: none;
}

@media (max-width: 1025px) {
  .NamesForm {
    width: 90%;
  }

  input {
    width: 90%;
  }

  .sign-up {
    left: 39.9%;
  }

  .PassForm {
    width: 90%;
    display: flex;
    justify-content: left;
    align-items: start;
    flex-direction: row;
  }

  .EmailForm {
    width: 90%;
  }

  .UserName {
    width: 90%;
  }

  .button {
    width: 90%;
  }

  .btn-center {
    display: none;
  }
}

@media (max-width: 1000px) {
  .toggle-container {
    display: none;
  }

  .container form {
    padding: 0 30px;
  }

  .sign-in {
    left: 0;
    width: 100%;
    z-index: 2;
  }

  .sign-up {
    left: 66.5%;
    width: 100%;
  }

  .Sgin-in {
    color: black !important;
  }
  .Sgin-in:hover {
    font-weight: bolder;
    color: #dc0000d3 !important;
  }

  .Sgin-up {
    color: black !important;
  }
  .Sgin-up:hover {
    font-weight: bolder;
    color: #dc0000d3 !important;
  }

  .btn-center p {
    text-align: left;
    color: rgb(0, 0, 0) !important;
    margin-right: 0.2rem;
  }

  .btn-center {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
  }

  .container .button.signup {
    margin-bottom: 0.6rem;
  }

  @media (max-height: 1024px) {
    .container {
      min-height: 60%;
    }
  }

  @media (max-height: 910px) {
    .container {
      min-height: 65%;
    }
  }
  @media (max-height: 820px) {
    .container {
      min-height: 70%;
    }
  }

  @media (max-height: 725px) {
    .container {
      min-height: 85%;
    }
  }

  @media (max-height: 600px) {
    .container {
      min-height: 95%;
    }
  }
}

@media (max-width: 768px) {
  .toggle-container {
    display: none;
  }

  .container form {
    padding: 0 30px;
  }

  .sign-in {
    left: 0;
    width: 100%;
    z-index: 2;
  }

  .sign-up {
    left: 66.5%;
    width: 100%;
  }

  .Sgin-in {
    color: black !important;
  }
  .Sgin-in:hover {
    font-weight: bolder;
    color: #dc0000d3 !important;
  }

  .Sgin-up {
    color: black !important;
  }
  .Sgin-up:hover {
    font-weight: bolder;
    color: #dc0000d3 !important;
  }

  .btn-center p {
    text-align: left;
    color: rgb(0, 0, 0) !important;
    margin-right: 0.2rem;
  }

  .btn-center {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
  }

  .container .button.signup {
    margin-bottom: 0.6rem;
  }

  @media (max-height: 1024px) {
    .container {
      min-height: 60%;
    }
  }

  @media (max-height: 910px) {
    .container {
      min-height: 65%;
    }
  }
  @media (max-height: 820px) {
    .container {
      min-height: 70%;
    }
  }

  @media (max-height: 725px) {
    .container {
      min-height: 85%;
    }
  }

  @media (max-height: 600px) {
    .container {
      min-height: 95%;
    }
  }
}

@media (max-width: 480px) {
  .toggle-container {
    display: none;
  }
  .sign-in {
    left: 0;
    width: 100%;
    z-index: 2;
  }

  .sign-up {
    left: 66.5%;
    width: 100%;
  }

  .Sgin-in {
    color: black !important;
    font-size: 11px !important;
  }
  .Sgin-in:hover {
    font-weight: bolder;
    color: #dc0000d3 !important;
  }

  .Sgin-up {
    color: black !important;
    font-size: 11px !important;
  }
  .Sgin-up:hover {
    font-weight: bolder;
    color: #dc0000d3 !important;
  }

  .btn-center p {
    font-size: 11px;
    text-align: left;
    color: rgb(0, 0, 0) !important;
    margin-right: 0.2rem;
  }

  .btn-center {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
  }

  .container .button.signup {
    margin-bottom: 0.6rem;
  }

  .container-signup {
    margin-bottom: 1rem;
  }

  .container-signup h1 {
    font-size: 1.5rem;
    font-weight: normal;
  }

  .UserName {
    width: 100%;
  }
  .EmailForm {
    width: 100%;
  }

  input {
    width: 100%;
  }
  .FirstName h3 {
    font-weight: 600;
    font-size: 12px;
  }
  .LastName h3 {
    font-weight: 600;
    font-size: 12px;
  }
  .EmailForm h3 {
    font-weight: 600;
    font-size: 12px;
  }
  .UserName h3 {
    font-weight: 600;
    font-size: 12px;
  }
  .Enter h3 {
    font-weight: 600;
    font-size: 12px;
  }
  .Confirm h3 {
    font-weight: 600;
    font-size: 12px;
  }

  .PassForm h3 {
    font-weight: 600;
    font-size: 11px;
  }

  .Confirm input {
    width: 100%;
  }

  .Enter input {
    width: 100%;
  }

  .container-signup .UP {
    font-size: 1.5rem;
    font-weight: bolder;
  }

  .button {
    width: 100%;
  }

  .NamesForm {
    width: 100% !important;
  }

  .PassForm {
    width: 100% !important;
  }

  .Login-gulugulu {
    width: 100%;
  }
  .container-signin h1 {
    font-size: 1.5rem;
  }

  .container-signin .IN {
    font-size: 1.5rem;
  }

  .container-signin {
    margin: 0;
  }

  @media (max-height: 1024px) {
    .container {
      min-height: 60%;
    }
  }

  @media (max-height: 910px) {
    .container {
      min-height: 60%;
    }
  }
  @media (max-height: 820px) {
    .container {
      min-height: 65%;
    }
  }

  @media (max-height: 725px) {
    .container {
      min-height: 80%;
    }
  }

  @media (max-height: 600px) {
    .container {
      min-height: 85%;
    }
  }

  @media (max-height: 525px) {
    .container {
      min-height: 95%;
    }
  }
}

@media (max-width: 375px) {
  .toggle-container {
    display: none;
  }
  .sign-in {
    left: 0;
    width: 100%;
    z-index: 2;
  }

  .sign-up {
    left: 66.5%;
    width: 100%;
  }

  .Sgin-in {
    color: black !important;
    font-size: 9px !important;
  }
  .Sgin-in:hover {
    font-weight: bolder;
    color: #dc0000d3 !important;
  }

  .Sgin-up {
    color: black !important;
    font-size: 9px !important;
  }
  .Sgin-up:hover {
    font-weight: bolder;
    color: #dc0000d3 !important;
  }

  .btn-center p {
    font-size: 9px;
    text-align: left;
    color: rgb(0, 0, 0) !important;
    margin-right: 0.2rem;
  }

  .btn-center {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
  }

  .container button {
    font-size: 9px !important;
    padding: 8px 45px;
  }

  .container .button.signup {
    margin-bottom: 0.6rem;
  }

  .container p {
    margin: 9.5px 0.2rem !important;
  }

  .container-signin {
    margin: 0;
  }

  .container-signin h1 {
    font-size: 1.5rem;
  }

  .container-signin .IN {
    font-size: 1.5rem;
  }

  .container-signup {
    margin-bottom: 1rem;
  }

  .container-signup h1 {
    font-size: 1.5rem;
    font-weight: normal;
  }

  .container span {
    font-size: 9px;
  }

  .UserName {
    width: 105%;
  }
  .EmailForm {
    width: 105%;
  }

  input {
    width: 105%;
    font-size: 9px;
  }
  .FirstName h3 {
    font-weight: 600;
    font-size: 10px;
  }
  .LastName h3 {
    font-weight: 600;
    font-size: 10px;
  }
  .EmailForm h3 {
    font-weight: 600;
    font-size: 10px;
  }
  .UserName h3 {
    font-weight: 600;
    font-size: 10px;
  }
  .Enter h3 {
    font-weight: 600;
    font-size: 10px;
  }
  .Confirm h3 {
    font-weight: 600;
    font-size: 10px;
  }

  .PassForm h3 {
    font-weight: 600;
    font-size: 9px;
  }

  .Confirm input {
    width: 100%;
  }

  .Enter input {
    width: 100%;
  }

  .container-signup .UP {
    font-size: 1.5rem;
    font-weight: bolder;
  }

  .button {
    width: 100%;
  }

  .NamesForm {
    width: 105% !important;
  }

  .PassForm {
    width: 105% !important;
  }

  .Login-gulugulu {
    width: 105%;
  }

  @media (max-height: 1024px) {
    .container {
      min-height: 50%;
    }
  }

  @media (max-height: 910px) {
    .container {
      min-height: 55%;
    }
  }
  @media (max-height: 820px) {
    .container {
      min-height: 65%;
    }
  }

  @media (max-height: 725px) {
    .container {
      min-height: 75%;
    }
  }

  @media (max-height: 600px) {
    .container {
      min-height: 80%;
    }
  }

  @media (max-height: 525px) {
    .container {
      min-height: 90%;
    }
  }
}
</style>
