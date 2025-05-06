const container = document.getElementById("container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");
const registerBtn2 = document.getElementById("register2");
const loginBtn2 = document.getElementById("login2");
const toggle = document.getElementById("tooogle");

registerBtn.addEventListener("click", () => {
  container.classList.add("active");
  toggle.classList.add("active");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
  toggle.classList.remove("active");
});

registerBtn2.addEventListener("click", () => {
  container.classList.add("active");
  toggle.classList.add("active");
});

loginBtn2.addEventListener("click", () => {
  container.classList.remove("active");
  toggle.classList.remove("active");
});

document
  .getElementById("formsignup")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    try {
      const response = await fetch("/signup", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        document.getElementById("msg-error").textContent =
          data.detail || "An unknown error occurred";
        document.getElementById("msg-error").style.display = "block";
      } else {
        alert("Account created successfully!");
        document.getElementById("formsignup").reset();
        document.getElementById("msg-error").style.display = "none";
      }
    } catch (error) {
      document.getElementById("msg-error").textContent =
        "Network error, please try again.";
      document.getElementById("msg-error").style.display = "block";
    }
  });
