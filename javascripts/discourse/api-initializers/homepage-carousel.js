import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("1.0.0", (api) => {
  // 主题组件设置通过 settings 全局变量访问
  const themeSettings = settings;

  // 解析轮播图配置 - 优先使用上传的图片
  const parseSlides = () => {
    const slides = [];
    
    // 检查上传的图片设置 (carousel_slide_1 到 carousel_slide_5)
    for (let i = 1; i <= 5; i++) {
      const slideKey = `carousel_slide_${i}`;
      const titleKey = `carousel_title_${i}`;
      const linkKey = `carousel_link_${i}`;
      
      const image = themeSettings[slideKey];
      if (image) {
        slides.push({
          image: image,
          title: themeSettings[titleKey] || "",
          link: themeSettings[linkKey] || "/",
        });
      }
    }
    
    // 如果有上传的图片，使用它们
    if (slides.length > 0) {
      return slides;
    }

    // 否则使用默认示例幻灯片
    return [
      {
        image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=400&fit=crop",
        title: "欢迎来到 OrcaSpace",
        link: "/",
      },
      {
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=400&fit=crop",
        title: "探索精彩话题",
        link: "/categories",
      },
      {
        image: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=1200&h=400&fit=crop",
        title: "加入我们的社区",
        link: "/about",
      },
    ];
  };

  const slides = parseSlides();
  const height = themeSettings.carousel_height || 300;
  const autoplay = themeSettings.carousel_autoplay !== false;
  const interval = themeSettings.carousel_interval || 5000;

  // 创建轮播图 HTML
  const createCarouselHTML = () => {
    const slidesHTML = slides
      .map(
        (slide, index) => `
      <div class="carousel-slide" data-index="${index}">
        ${slide.link ? `<a href="${slide.link}">` : ""}
          <img src="${slide.image}" alt="${slide.title || `Slide ${index + 1}`}" loading="${index === 0 ? "eager" : "lazy"}">
          ${slide.title ? `<div class="slide-overlay"><h3 class="slide-title">${slide.title}</h3></div>` : ""}
        ${slide.link ? "</a>" : ""}
      </div>
    `
      )
      .join("");

    const dotsHTML = slides
      .map(
        (_, index) =>
          `<button class="dot ${index === 0 ? "active" : ""}" data-index="${index}" aria-label="Go to slide ${index + 1}"></button>`
      )
      .join("");

    return `
      <div class="homepage-carousel" style="--carousel-height: ${height}px">
        <div class="carousel-container">
          <div class="carousel-slides">
            ${slidesHTML}
          </div>
          ${slides.length > 1 ? `
            <button class="carousel-nav prev" aria-label="Previous slide">‹</button>
            <button class="carousel-nav next" aria-label="Next slide">›</button>
            <div class="carousel-dots">${dotsHTML}</div>
          ` : ""}
        </div>
      </div>
    `;
  };

  // 初始化轮播图逻辑
  const initCarousel = (container) => {
    if (slides.length <= 1) return;

    const slidesEl = container.querySelector(".carousel-slides");
    const dots = container.querySelectorAll(".dot");
    const prevBtn = container.querySelector(".carousel-nav.prev");
    const nextBtn = container.querySelector(".carousel-nav.next");

    let currentIndex = 0;
    let autoplayTimer = null;

    const goToSlide = (index) => {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      
      currentIndex = index;
      slidesEl.style.transform = `translateX(-${currentIndex * 100}%)`;

      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === currentIndex);
      });
    };

    const startAutoplay = () => {
      if (!autoplay) return;
      stopAutoplay();
      autoplayTimer = setInterval(() => goToSlide(currentIndex + 1), interval);
    };

    const stopAutoplay = () => {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    };

    prevBtn?.addEventListener("click", () => {
      goToSlide(currentIndex - 1);
      startAutoplay();
    });

    nextBtn?.addEventListener("click", () => {
      goToSlide(currentIndex + 1);
      startAutoplay();
    });

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        goToSlide(parseInt(dot.dataset.index, 10));
        startAutoplay();
      });
    });

    container.addEventListener("mouseenter", stopAutoplay);
    container.addEventListener("mouseleave", startAutoplay);

    let touchStartX = 0;
    container.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
      stopAutoplay();
    }, { passive: true });

    container.addEventListener("touchend", (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        goToSlide(diff > 0 ? currentIndex + 1 : currentIndex - 1);
      }
      startAutoplay();
    }, { passive: true });

    startAutoplay();
  };

  // 插入轮播图的函数
  let isInserted = false;
  
  const insertCarousel = () => {
    // 双重检查防止重复
    if (isInserted || document.querySelector(".homepage-carousel")) {
      return;
    }

    const insertTargets = [
      ".navigation-container",
      ".list-controls", 
      "#main-outlet .container",
      "#main-outlet",
    ];

    let targetElement = null;
    for (const selector of insertTargets) {
      targetElement = document.querySelector(selector);
      if (targetElement) break;
    }

    if (!targetElement) return;

    // 标记已插入
    isInserted = true;

    const carouselDiv = document.createElement("div");
    carouselDiv.innerHTML = createCarouselHTML();
    const carousel = carouselDiv.firstElementChild;

    targetElement.parentNode.insertBefore(carousel, targetElement);
    initCarousel(carousel);
  };

  // 监听页面变化
  api.onPageChange((url) => {
    // 移除旧的轮播图并重置状态
    const existing = document.querySelector(".homepage-carousel");
    if (existing) {
      existing.remove();
    }
    isInserted = false;

    // 只在首页相关页面显示
    const isHomePage = url === "/" || 
                       url.startsWith("/latest") || 
                       url.startsWith("/categories") || 
                       url.startsWith("/top") ||
                       url.startsWith("/new") ||
                       url.startsWith("/unread");
    
    if (!isHomePage) return;

    // 延迟插入，确保 DOM 已加载
    setTimeout(insertCarousel, 200);
  });
});
