import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("1.0.0", (api) => {
  const themeSettings = settings;

  // 预设图标 SVG
  const icons = {
    sparkles: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`,
    zap: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    message: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    star: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    rocket: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`
  };

  // 默认幻灯片配置
  const defaultSlides = [
    {
      tag: "🔥 Community Hot",
      title: "AI 创新挑战赛",
      highlight: "获奖名单现已公布",
      btnText: "点击查看详情",
      gradient: "gradient-1",
      icon: "sparkles",
      link: "/"
    },
    {
      tag: "💡 New Insight",
      title: "2026 交互设计",
      highlight: "未来计算平台趋势",
      btnText: "立即探索",
      gradient: "gradient-2",
      icon: "zap",
      link: "/categories"
    },
    {
      tag: "📢 Official",
      title: "匿名发帖指南",
      highlight: "守护每一份真实的表达",
      btnText: "阅读规范",
      gradient: "gradient-3",
      icon: "message",
      link: "/about"
    }
  ];

  // 解析用户配置的幻灯片
  const parseSlides = () => {
    const slides = [];
    const gradients = ["gradient-1", "gradient-2", "gradient-3", "gradient-4", "gradient-5"];
    const iconKeys = ["sparkles", "zap", "message", "star", "rocket"];

    for (let i = 1; i <= 5; i++) {
      const title = themeSettings[`carousel_title_${i}`];
      const link = themeSettings[`carousel_link_${i}`];
      
      // 如果有标题，则创建幻灯片
      if (title) {
        slides.push({
          tag: themeSettings[`carousel_tag_${i}`] || `✨ Slide ${i}`,
          title: title.split("|")[0] || title,
          highlight: title.split("|")[1] || "",
          btnText: themeSettings[`carousel_btn_${i}`] || "了解更多",
          gradient: gradients[(i - 1) % gradients.length],
          icon: iconKeys[(i - 1) % iconKeys.length],
          link: link || "/"
        });
      }
    }

    return slides.length > 0 ? slides : defaultSlides;
  };

  const slides = parseSlides();
  const height = themeSettings.carousel_height || 280;
  const autoplay = themeSettings.carousel_autoplay !== false;
  const interval = themeSettings.carousel_interval || 5000;

  // 创建轮播图 HTML
  const createCarouselHTML = () => {
    const slidesHTML = slides.map((slide, index) => `
      <div class="carousel-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
        <div class="slide-bg ${slide.gradient}"></div>
        <div class="slide-texture"></div>
        <div class="slide-content">
          <div class="slide-text">
            <div class="slide-tag">${slide.tag}</div>
            <h2 class="slide-title">
              ${slide.title}
              ${slide.highlight ? `<br><span class="slide-highlight">${slide.highlight}</span>` : ''}
            </h2>
            <a href="${slide.link}" class="slide-btn">${slide.btnText}</a>
          </div>
          <div class="slide-icon-wrapper">
            <div class="slide-icon-shadow"></div>
            <div class="slide-icon-box">
              ${icons[slide.icon] || icons.sparkles}
            </div>
          </div>
        </div>
      </div>
    `).join("");

    const dotsHTML = slides.map((_, index) => 
      `<button class="carousel-dot ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="Go to slide ${index + 1}"></button>`
    ).join("");

    return `
      <div class="homepage-carousel" style="--carousel-height: ${height}px">
        <div class="carousel-slides">
          ${slidesHTML}
        </div>
        ${slides.length > 1 ? `
          <button class="carousel-nav prev" aria-label="Previous slide">‹</button>
          <button class="carousel-nav next" aria-label="Next slide">›</button>
          <div class="carousel-dots">${dotsHTML}</div>
        ` : ''}
      </div>
    `;
  };

  // 判断是否是需要显示轮播图的页面
  const isCarouselPage = (url) => {
    return url === "/" ||
      url.startsWith("/latest") ||
      url.startsWith("/categories") ||
      url.startsWith("/top") ||
      url.startsWith("/hot") ||
      url.startsWith("/new") ||
      url.startsWith("/unread");
  };

  // 轮播图实例引用
  let carouselInstance = null;
  let currentSlideIndex = 0;
  let autoplayTimer = null;

  // 创建轮播图元素
  const createCarouselElement = () => {
    const carouselDiv = document.createElement("div");
    carouselDiv.innerHTML = createCarouselHTML();
    return carouselDiv.firstElementChild;
  };

  // 初始化轮播图交互
  const initCarouselInteraction = (container) => {
    if (slides.length <= 1) return;

    const slideEls = container.querySelectorAll(".carousel-slide");
    const dots = container.querySelectorAll(".carousel-dot");
    const prevBtn = container.querySelector(".carousel-nav.prev");
    const nextBtn = container.querySelector(".carousel-nav.next");

    const goToSlide = (index) => {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;

      slideEls.forEach(el => el.classList.remove("active"));
      dots.forEach(el => el.classList.remove("active"));

      currentSlideIndex = index;
      slideEls[currentSlideIndex].classList.add("active");
      dots[currentSlideIndex].classList.add("active");
    };

    const startAutoplay = () => {
      if (!autoplay) return;
      stopAutoplay();
      autoplayTimer = setInterval(() => goToSlide(currentSlideIndex + 1), interval);
    };

    const stopAutoplay = () => {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    };

    prevBtn?.addEventListener("click", () => {
      goToSlide(currentSlideIndex - 1);
      startAutoplay();
    });

    nextBtn?.addEventListener("click", () => {
      goToSlide(currentSlideIndex + 1);
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
        goToSlide(diff > 0 ? currentSlideIndex + 1 : currentSlideIndex - 1);
      }
      startAutoplay();
    }, { passive: true });

    startAutoplay();
  };

  // 显示轮播图
  const showCarousel = () => {
    // 如果已经存在且可见，不做任何操作
    const existing = document.querySelector(".homepage-carousel");
    if (existing) {
      existing.style.display = "";
      return;
    }

    // 找到插入位置 - 使用更稳定的容器
    const mainOutlet = document.querySelector("#main-outlet");
    if (!mainOutlet) {
      setTimeout(showCarousel, 100);
      return;
    }

    // 创建新的轮播图
    carouselInstance = createCarouselElement();
    mainOutlet.insertBefore(carouselInstance, mainOutlet.firstChild);
    initCarouselInteraction(carouselInstance);
  };

  // 隐藏轮播图（而不是删除）
  const hideCarousel = () => {
    const existing = document.querySelector(".homepage-carousel");
    if (existing) {
      existing.style.display = "none";
    }
  };

  // 监听页面变化
  api.onPageChange((url) => {
    const shouldShow = isCarouselPage(url);

    if (shouldShow) {
      // 延迟一点确保 DOM 已更新
      setTimeout(showCarousel, 50);
    } else {
      hideCarousel();
    }
  });

  // 使用 MutationObserver 监控轮播图是否被意外删除
  const setupObserver = () => {
    const mainOutlet = document.querySelector("#main-outlet");
    if (!mainOutlet) {
      setTimeout(setupObserver, 500);
      return;
    }

    const observer = new MutationObserver(() => {
      const currentUrl = window.location.pathname;
      const shouldShow = isCarouselPage(currentUrl);
      const existing = document.querySelector(".homepage-carousel");

      // 如果应该显示但不存在，重新创建
      if (shouldShow && !existing) {
        setTimeout(showCarousel, 50);
      }
    });

    observer.observe(mainOutlet, { childList: true, subtree: false });
  };

  // 初始化
  setupObserver();
});
