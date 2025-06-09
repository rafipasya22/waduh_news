<template>
  <div class="footer py-3">
    <div class="footer-top d-flex justify-content-between align-items-center">
      <div class="socials d-flex flex-column justify-content-evenly">
        <div class="text">Follow Us</div>
      </div>
      <div class="logos d-flex align-items-center">
        <a href="http://facebook.com"><i class="fa-brands fa-facebook"></i></a>
        <a href="http://youtube.com"><i class="fa-brands fa-youtube"></i></a>
        <a href="http://x.com"><i class="fa-brands fa-x-twitter"></i></a>
      </div>
    </div>
    <hr class="divider-footer mt-3 mb-2" />
    <div class="footer-mid d-flex justify-content-between align-items-center">
      <div class="title-footer">
        <h2>Waduh</h2>
        <h2>News</h2>
        <p>Stay Informed, Stay Ahead—Bringing You the News That Matters.</p>
      </div>
      <div class="explore-footer mb-5">
        <table class="table mx-2 mb-5">
          <thead>
            <tr>
              <th scope="col">Explore</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>
                <router-link to="/news/category/sports" class="nav-link" aria-current="page"
                  >Sports</router-link
                >
              </th>
              <td>
                <router-link to="/news/category/technology" class="nav-link" aria-current="page"
                  >Technology</router-link
                >
              </td>
              <td>
                <router-link to="/news/category/health" class="nav-link" aria-current="page"
                  >Health</router-link
                >
              </td>
            </tr>
            <tr>
              <th>
                <router-link to="/news/category/science" class="nav-link" aria-current="page"
                  >Science</router-link
                >
              </th>
              <td>
                <router-link to="/news/category/entertainment" class="nav-link" aria-current="page"
                  >Entertainment</router-link
                >
              </td>
              <td>
                <router-link to="/news/category/business" class="nav-link" aria-current="page"
                  >Business</router-link
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <hr class="divider-footer mt-3 mb-2" />
    <div class="footer-bottom d-flex justify-content-between align-items-start">
      <div class="copyright mb-3">© Waduh News 2025</div>
    </div>
  </div>
</template>
