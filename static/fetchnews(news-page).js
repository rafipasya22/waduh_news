document.addEventListener("DOMContentLoaded", function () {
    const currentCategory = document.body.dataset.category;
    console.log(currentCategory);
  
    fetch(`/api/ambil_nxtnews/${encodeURIComponent(currentCategory)}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
  
        if (data.error) {
          console.error(data.error);
          return;
        }
  
        const articles = data.news;
  
        if (articles.length === 0) return;
  
        const randomIndex = Math.floor(Math.random() * articles.length);
        const nxtNews = articles[randomIndex];
        console.log(nxtNews);
  
        const nxtNewsContainer = document.querySelector(
          ".sports.nxt-stories .post-mid"
        );
        const nxtNewsContent = nxtNewsContainer.querySelector(".post-content");
        const nxtNewsRedirectImg = nxtNewsContent.querySelector(".container-img");
        const nxtNewsImg = nxtNewsContent.querySelector(".container-img img");
        const nxtNewsRedirect = nxtNewsContent.querySelector(".post-text");
        const nxtNewsText = nxtNewsContent.querySelector(".post-text .title-mid");
        const cat = document.querySelector(".post-text .news-cat");
        const catText = document.querySelector(".post-text .news-cat p");
        const capCatText =
          nxtNews.category.charAt(0).toUpperCase() +
          nxtNews.category.slice(1).toLowerCase();
  
        if (cat) {
          cat.classList.add(capCatText);
          catText.innerHTML = capCatText;
        }
        if (nxtNewsImg)
          nxtNewsImg.src = nxtNews.imageUrl || "../static/Assets/img/default.jpg";
        if (nxtNewsText) {
          nxtNewsText.innerHTML = nxtNews.title;
          nxtNewsRedirect.href = `/api/baca-news/headline/${encodeURIComponent(
            nxtNews.category
          )}/${encodeURIComponent(nxtNews.title)}`;
          nxtNewsRedirectImg.href = `/api/baca-news/headline/${encodeURIComponent(
            nxtNews.category
          )}/${encodeURIComponent(nxtNews.title)}`;
        }
      })
      .catch((err) => {
        console.error("Error fetching news:", err);
      });
  });
  