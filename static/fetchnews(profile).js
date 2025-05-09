document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch("/api/user-bookmarks");
        const result = await response.json();
    
        const titles = result["Bookmarked Titles: "];
        if (titles && titles.length > 0) {
          console.log("Bookmark titles:", titles);
    
          const postMidContainers = document.querySelectorAll(".post-mid");
    
          titles.forEach((item, index) => {
            const title = item;
            const targetPost = postMidContainers[index]; 
            if (title && targetPost) {
              fetchAndDisplayNews(title, targetPost);
            }else if(!title){
                console.log("Title Gaada");
            }else if(!targetPost){
                console.log("Post Gaada");
            }else{
                console.log("target dan title gaada");
            }
          });
    
        } else {
          console.warn("Tidak ada data bookmark ditemukan:", result);
        }
      } catch (error) {
        console.error("Gagal mengambil data bookmark:", error);
      }


});

  async function fetchAndDisplayNews(title, postMid) {
    try {
      const res = await fetch(`/api/get/user-bookmarks/${encodeURIComponent(title)}`);
      const data = await res.json();
      console.log(data);
  
      if (data.error) {
        console.error(data.error);
        return;
      }
  
      const article = data.news?.[0];
      if (!article) return;
  
      const postContent = postMid.querySelector(".post-content");
      if (!postContent) return;
  
      const imgElement = postContent.querySelector(".container-img img");
      if (imgElement) {
        imgElement.src = article.imageUrl || "/static/Assets/img/default.jpg";
      }
  
      const PostTitle = postContent.querySelector(".post-text .title-mid");
      const TitleContainer = postContent.querySelector(".post-text");
      const redirectimg = postContent.querySelector(".container-img");
  
      if (PostTitle) {
        PostTitle.textContent = article.title;
        if (TitleContainer) {
          TitleContainer.href = `/api/baca-news/general/${encodeURIComponent(article.title)}`;
        }
        if (redirectimg) {
          redirectimg.href = `/api/baca-news/general/${encodeURIComponent(article.title)}`;
        }
      }else{
        console.log("PostTitle does not exist");
      }
  
    } catch (err) {
      console.error("Error fetching news:", err);
    }
  }
  