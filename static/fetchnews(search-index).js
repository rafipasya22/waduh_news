document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q");
  if (query) {
    console.log(encodeURIComponent(query));
    fetchAndDisplayNews(query);
  }

  const form = document.getElementById("advancedSearchForm");

  form.addEventListener("submit", function (event) {
    event.preventDefault(); 
    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;

    function getCheckedCategories() {
      return Array.from(
        document.querySelectorAll("input[type=checkbox].cat:checked")
      ).map((checkbox) => checkbox.value);
    }

    const checkedCategories = getCheckedCategories();

    if(fromDate && toDate){
      if(checkedCategories.length > 0){
        fetchAndDisplayNews3(query, checkedCategories, fromDate, toDate);
      }else{
        fetchAndDisplayNews4(query, fromDate, toDate);
      }
    }else{
      if(checkedCategories.length > 0){
        fetchAndDisplayNews2(query, checkedCategories);
      }else{
        fetchAndDisplayNews(query);
      }
    }

    console.log("From:", fromDate);
    console.log("To:", toDate);
    console.log("Selected categories:", checkedCategories);
  });

  const checkboxes = document.querySelectorAll(".form-check-input.cat");
    const dropdownTitle = document.querySelector(
      ".adv-search-item-dropdown-title"
    );

    function updateDropdownTitle() {
      const checkedCount = document.querySelectorAll(
        ".form-check-input.cat:checked"
      ).length;
      console.log(checkedCount);
      if (checkedCount > 0) {
        dropdownTitle.textContent = `${checkedCount} Categor${
          checkedCount > 1 ? "ies" : "y"
        } Chosen`;
      } else {
        dropdownTitle.textContent = "Choose Categories";
      }
    }

    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", updateDropdownTitle);
    });

    updateDropdownTitle();
});

async function fetchAndDisplayNews(
  query,
  page = 1,
  pageSize = 5,
  event = null
) {
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }
  try {
    const response = await fetch(
      `/api/news/search/${encodeURIComponent(
        query
      )}?page=${page}&page_size=${pageSize}`
    );
    const data = await response.json();
    console.log(data);

    if (data.error) {
      console.error(data.error);
      return;
    }

    const newsList = data.news;
    const newsContainer = document.querySelector(".container-post");

    const searchResuld = document.querySelector(".search-rslt");

    searchResuld.innerHTML = `Search result: "${query}" found in ${data.total_items} posts`;

    newsContainer.innerHTML = "";

    newsList.forEach((news) => {
      const postElement = document.createElement("div");
      const redirect = `/api/search/baca-news/${encodeURIComponent(news.category)}/${encodeURIComponent(news.title)}`;
      const catClass =
        news.category.charAt(0).toUpperCase() +
        news.category.slice(1).toLowerCase();
      postElement.classList.add(
        "post-long",
        "d-flex",
        "justify-content-start",
        "align-items-start",
        "flex-row",
        "p-1",
        "mb-3"
      );

      let newsSource = ``;

      if (news.author && news.source_name) {
        newsSource = `<small class="news-long-reporter"><i>Reported By ${news.author} via ${news.source_name}</i></small>`;
      } else if (news.author) {
        newsSource = `<small class="news-long-reporter"><i>Reported By ${news.author}</i></small>`;
      } else if (news.source_name) {
        newsSource = `<small class="news-long-reporter"><i>Reported via ${news.source_name}</i></small>`;
      } else {
        newsSource = `<small class="news-long-reporter"><i>No Source</i></small>`;
      }

      postElement.innerHTML = `
            <div class="post-image">
              <a href="${redirect}" class="container-img">
                <img src="${news.imageUrl}" alt="Image for ${news.title}" />
              </a>
            </div>
            <div class="post-content d-flex justify-content-between align-items-start flex-column">
              <div class="text-area-post-long d-flex justify-content-start align-items-start flex-column">
                <a href="${redirect}" class="post-text-long"><h4>${
        news.title
      }</h4></a>
                <small class="news-long-upload-date">Uploaded ${new Date(
                  news.publishedAt
                ).toLocaleDateString()}</small>
                ${newsSource}
                <div class="categories-long news-cat ${catClass} mt-2">
                  <div class="cat-text px-1">
                    <p class="px-1">${catClass}</p>
                  </div>
                </div>
              </div>
            </div>
          `;

      newsContainer.appendChild(postElement);
    });

    handlePagination(query, data.total_pages, page);
  } catch (error) {
    console.error("Error fetching news:", error);
  }
}

async function fetchAndDisplayNews2(
  query,
  category = [],
  page = 1,
  pageSize = 5,
  event = null
) {
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  const allNews = []; 
  let totalPages = 1; 

  for (const cat of category) {
    try {
      const response = await fetch(
        `/api/news/search/${encodeURIComponent(query)}/${encodeURIComponent(cat)}?page=${page}&page_size=${pageSize}`
      );
      const data = await response.json();
      console.log(data);

      if (data.error) {
        console.error(data.error);
        return;
      }
      allNews.push(...data.news);

      totalPages = data.total_pages;

    } catch (error) {
      console.error("Error fetching news:", error);
    }
  }

  const newsContainer = document.querySelector(".container-post");
  const searchResuld = document.querySelector(".search-rslt");

  searchResuld.innerHTML = `Search result: "${query}" found in ${allNews.length} posts`;

  newsContainer.innerHTML = ""; 

  allNews.forEach((news) => {
    const postElement = document.createElement("div");
    const redirect = `/api/search/baca-news/${encodeURIComponent(news.category)}/${encodeURIComponent(news.title)}`;
    const catClass =
      news.category.charAt(0).toUpperCase() + news.category.slice(1).toLowerCase();
    postElement.classList.add(
      "post-long",
      "d-flex",
      "justify-content-start",
      "align-items-start",
      "flex-row",
      "p-1",
      "mb-3"
    );

    let newsSource = ``;

    if (news.author && news.source_name) {
      newsSource = `<small class="news-long-reporter"><i>Reported By ${news.author} via ${news.source_name}</i></small>`;
    } else if (news.author) {
      newsSource = `<small class="news-long-reporter"><i>Reported By ${news.author}</i></small>`;
    } else if (news.source_name) {
      newsSource = `<small class="news-long-reporter"><i>Reported via ${news.source_name}</i></small>`;
    } else {
      newsSource = `<small class="news-long-reporter"><i>No Source</i></small>`;
    }

    postElement.innerHTML = `
          <div class="post-image">
            <a href="${redirect}" class="container-img">
              <img src="${news.imageUrl}" alt="Image for ${news.title}" />
            </a>
          </div>
          <div class="post-content d-flex justify-content-between align-items-start flex-column">
            <div class="text-area-post-long d-flex justify-content-start align-items-start flex-column">
              <a href="${redirect}" class="post-text-long"><h4>${news.title}</h4></a>
              <small class="news-long-upload-date">Uploaded ${new Date(news.publishedAt).toLocaleDateString()}</small>
              ${newsSource}
              <div class="categories-long news-cat ${catClass} mt-2">
                <div class="cat-text px-1">
                  <p class="px-1">${catClass}</p>
                </div>
              </div>
            </div>
          </div>
        `;

    newsContainer.appendChild(postElement);
  });

  handlePagination2(query, totalPages, page); 
}

async function fetchAndDisplayNews3(
  query,
  category = [],
  fromDate,
  toDate,
  page = 1,
  pageSize = 5,
  event = null
) {
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  const allNews = []; 
  let totalPages = 1; 

  for (const cat of category) {
    try {
      const response = await fetch(
        `/api/news/advsearch/${query}/${cat}?from_date=${fromDate}&to_date=${toDate}&page=${page}&page_size=${pageSize}`
      );
      const data = await response.json();
      console.log(data);

      if (data.error) {
        console.error(data.error);
        return;
      }
      allNews.push(...data.news);

      totalPages = data.total_pages;

    } catch (error) {
      console.error("Error fetching news:", error);
    }
  }

  const newsContainer = document.querySelector(".container-post");
  const searchResuld = document.querySelector(".search-rslt");

  searchResuld.innerHTML = `Search result: "${query}" found in ${allNews.length} posts`;

  newsContainer.innerHTML = ""; 

  allNews.forEach((news) => {
    const postElement = document.createElement("div");
    const redirect = `/api/search/baca-news/${encodeURIComponent(news.category)}/${encodeURIComponent(news.title)}`;
    const catClass =
      news.category.charAt(0).toUpperCase() + news.category.slice(1).toLowerCase();
    postElement.classList.add(
      "post-long",
      "d-flex",
      "justify-content-start",
      "align-items-start",
      "flex-row",
      "p-1",
      "mb-3"
    );

    let newsSource = ``;

    if (news.author && news.source_name) {
      newsSource = `<small class="news-long-reporter"><i>Reported By ${news.author} via ${news.source_name}</i></small>`;
    } else if (news.author) {
      newsSource = `<small class="news-long-reporter"><i>Reported By ${news.author}</i></small>`;
    } else if (news.source_name) {
      newsSource = `<small class="news-long-reporter"><i>Reported via ${news.source_name}</i></small>`;
    } else {
      newsSource = `<small class="news-long-reporter"><i>No Source</i></small>`;
    }

    postElement.innerHTML = `
          <div class="post-image">
            <a href="${redirect}" class="container-img">
              <img src="${news.imageUrl}" alt="Image for ${news.title}" />
            </a>
          </div>
          <div class="post-content d-flex justify-content-between align-items-start flex-column">
            <div class="text-area-post-long d-flex justify-content-start align-items-start flex-column">
              <a href="${redirect}" class="post-text-long"><h4>${news.title}</h4></a>
              <small class="news-long-upload-date">Uploaded ${new Date(news.publishedAt).toLocaleDateString()}</small>
              ${newsSource}
              <div class="categories-long news-cat ${catClass} mt-2">
                <div class="cat-text px-1">
                  <p class="px-1">${catClass}</p>
                </div>
              </div>
            </div>
          </div>
        `;

    newsContainer.appendChild(postElement);
  });

  handlePagination3(query, totalPages, page); 
}

async function fetchAndDisplayNews4(
  query,
  fromDate,
  toDate,
  page = 1,
  pageSize = 5,
  event = null
) {
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }
  try {
    const response = await fetch(
      `/api/news/advsearch/${encodeURIComponent(
        query
      )}?from_date=${fromDate}&to_date=${toDate}&page=${page}&page_size=${pageSize}`
    );
    const data = await response.json();
    console.log(data);

    if (data.error) {
      console.error(data.error);
      return;
    }

    const newsList = data.news;
    const newsContainer = document.querySelector(".container-post");

    const searchResuld = document.querySelector(".search-rslt");

    searchResuld.innerHTML = `Search result: "${query}" found in ${data.total_items} posts`;

    newsContainer.innerHTML = "";

    newsList.forEach((news) => {
      const postElement = document.createElement("div");
      const redirect = `/api/search/baca-news/${encodeURIComponent(news.category)}/${encodeURIComponent(news.title)}`;
      const catClass =
        news.category.charAt(0).toUpperCase() +
        news.category.slice(1).toLowerCase();
      postElement.classList.add(
        "post-long",
        "d-flex",
        "justify-content-start",
        "align-items-start",
        "flex-row",
        "p-1",
        "mb-3"
      );

      let newsSource = ``;

      if (news.author && news.source_name) {
        newsSource = `<small class="news-long-reporter"><i>Reported By ${news.author} via ${news.source_name}</i></small>`;
      } else if (news.author) {
        newsSource = `<small class="news-long-reporter"><i>Reported By ${news.author}</i></small>`;
      } else if (news.source_name) {
        newsSource = `<small class="news-long-reporter"><i>Reported via ${news.source_name}</i></small>`;
      } else {
        newsSource = `<small class="news-long-reporter"><i>No Source</i></small>`;
      }

      postElement.innerHTML = `
            <div class="post-image">
              <a href="${redirect}" class="container-img">
                <img src="${news.imageUrl}" alt="Image for ${news.title}" />
              </a>
            </div>
            <div class="post-content d-flex justify-content-between align-items-start flex-column">
              <div class="text-area-post-long d-flex justify-content-start align-items-start flex-column">
                <a href="${redirect}" class="post-text-long"><h4>${
        news.title
      }</h4></a>
                <small class="news-long-upload-date">Uploaded ${new Date(
                  news.publishedAt
                ).toLocaleDateString()}</small>
                ${newsSource}
                <div class="categories-long news-cat ${catClass} mt-2">
                  <div class="cat-text px-1">
                    <p class="px-1">${catClass}</p>
                  </div>
                </div>
              </div>
            </div>
          `;

      newsContainer.appendChild(postElement);
    });

    handlePagination(query, data.total_pages, page);
  } catch (error) {
    console.error("Error fetching news:", error);
  }
}


function handlePagination(query, totalPages, currentPage) {
  const paginationContainer = document.querySelector(".pageination");
  paginationContainer.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("li");
    pageButton.classList.add("page-item");
    pageButton.innerHTML = `<a class="page-link number ${
      i === currentPage ? "active" : ""
    }" onclick="fetchAndDisplayNews('${query}', ${i}, 5, event)">${i}</a>`;
    paginationContainer.appendChild(pageButton);
  }
}

function handlePagination2(query, totalPages, currentPage) {
  const paginationContainer = document.querySelector(".pageination");
  paginationContainer.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("li");
    pageButton.classList.add("page-item");
    pageButton.innerHTML = `<a class="page-link number ${
      i === currentPage ? "active" : ""
    }" onclick="fetchAndDisplayNews2('${query}', ${i}, 5, event)">${i}</a>`;
    paginationContainer.appendChild(pageButton);
  }
}

function handlePagination3(query, totalPages, currentPage) {
  const paginationContainer = document.querySelector(".pageination");
  paginationContainer.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("li");
    pageButton.classList.add("page-item");
    pageButton.innerHTML = `<a class="page-link number ${
      i === currentPage ? "active" : ""
    }" onclick="fetchAndDisplayNews3('${query}', ${i}, 5, event)">${i}</a>`;
    paginationContainer.appendChild(pageButton);
  }
}

function handlePagination3(query, totalPages, currentPage) {
  const paginationContainer = document.querySelector(".pageination");
  paginationContainer.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("li");
    pageButton.classList.add("page-item");
    pageButton.innerHTML = `<a class="page-link number ${
      i === currentPage ? "active" : ""
    }" onclick="fetchAndDisplayNews4('${query}', ${i}, 5, event)">${i}</a>`;
    paginationContainer.appendChild(pageButton);
  }
}
