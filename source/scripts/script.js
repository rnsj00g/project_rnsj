const grid = document.querySelector("#post-grid");
const count = document.querySelector("#post-count");
const filterButtons = document.querySelectorAll(".filter");
const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector("#site-nav");
const dialog = document.querySelector("#post-dialog");
const dialogClose = document.querySelector(".dialog-close");
const dialogCategory = document.querySelector("#dialog-category");
const dialogDate = document.querySelector("#dialog-date");
const markdownContent = document.querySelector("#markdown-content");
const colors = { blue: "var(--blue)", periwinkle: "var(--periwinkle)", indigo: "var(--indigo)", violet: "var(--violet)", plum: "var(--plum)", purple: "var(--purple)", cobalt: "var(--cobalt)" };
let previousFocus = null;

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function inlineMarkdown(text) {
  return text
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function renderMarkdown(markdown) {
  const lines = escapeHtml(markdown).replace(/\r/g, "").split("\n");
  const output = [];
  let listType = "";
  let inCode = false;

  function closeList() {
    if (listType) output.push(`</${listType}>`);
    listType = "";
  }

  lines.forEach((line) => {
    if (line.startsWith("```")) {
      closeList();
      output.push(inCode ? "</code></pre>" : "<pre><code>");
      inCode = !inCode;
      return;
    }
    if (inCode) {
      output.push(`${line}\n`);
      return;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    const unordered = line.match(/^[-*]\s+(.+)$/);
    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (heading) {
      closeList();
      const level = heading[1].length;
      output.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
    } else if (unordered) {
      if (listType !== "ul") { closeList(); output.push("<ul>"); listType = "ul"; }
      output.push(`<li>${inlineMarkdown(unordered[1])}</li>`);
    } else if (ordered) {
      if (listType !== "ol") { closeList(); output.push("<ol>"); listType = "ol"; }
      output.push(`<li>${inlineMarkdown(ordered[1])}</li>`);
    } else if (line.startsWith("&gt; ")) {
      closeList();
      output.push(`<blockquote>${inlineMarkdown(line.slice(5))}</blockquote>`);
    } else if (line.trim()) {
      closeList();
      output.push(`<p>${inlineMarkdown(line)}</p>`);
    } else {
      closeList();
    }
  });
  closeList();
  if (inCode) output.push("</code></pre>");
  return output.join("");
}

function renderPosts(filter = "all") {
  const posts = portfolioPosts.filter((post) => filter === "all" || post.category === filter);
  count.textContent = `${posts.length}개의 기록`;
  if (!posts.length) {
    grid.innerHTML = '<p class="empty-state">아직 등록된 글이 없습니다.</p>';
    return;
  }
  grid.innerHTML = posts.map((post, index) => {
    const number = String(index + 1).padStart(2, "0");
    const accent = colors[post.accent] || colors.blue;
    return `<article class="post-card"><a class="post-link" href="?post=${encodeURIComponent(post.slug)}" data-slug="${escapeHtml(post.slug)}" aria-label="${escapeHtml(post.title)} 읽기"><div class="post-visual" style="--accent: ${accent}"><span class="post-index" aria-hidden="true">${number}</span></div><div class="post-info"><div class="post-meta"><span>${escapeHtml(post.label)}</span><time>${escapeHtml(post.date)}</time></div><h3 class="post-title">${escapeHtml(post.title)} <span aria-hidden="true">→</span></h3><p class="post-description">${escapeHtml(post.description)}</p></div></a></article>`;
  }).join("");
}

async function openPost(slug, updateHistory = true) {
  const post = portfolioPosts.find((item) => item.slug === slug);
  if (!post) return;
  previousFocus = document.activeElement;
  dialogCategory.textContent = post.label;
  dialogDate.textContent = post.date;
  markdownContent.innerHTML = '<h1 id="dialog-title" class="loading-message">글을 불러오는 중입니다…</h1>';
  if (!dialog.open) dialog.showModal();
  document.body.classList.add("dialog-open");
  if (updateHistory) {
    const url = new URL(window.location.href);
    url.searchParams.set("post", post.slug);
    history.pushState({ post: post.slug }, "", url);
  }
  try {
    const response = await fetch(post.content);
    if (!response.ok) throw new Error("content-not-found");
    markdownContent.innerHTML = renderMarkdown(await response.text());
    document.querySelector("#dialog-title")?.removeAttribute("id");
    const title = markdownContent.querySelector("h1");
    if (title) title.id = "dialog-title";
    dialog.scrollTop = 0;
  } catch {
    markdownContent.innerHTML = '<h1 id="dialog-title">글을 불러오지 못했습니다.</h1><p>잠시 후 다시 시도해 주세요.</p>';
  }
}

function closePost(updateHistory = true) {
  if (dialog.open) dialog.close();
  document.body.classList.remove("dialog-open");
  if (updateHistory) {
    const url = new URL(window.location.href);
    url.searchParams.delete("post");
    history.pushState({}, "", url);
  }
  previousFocus?.focus();
}

grid.addEventListener("click", (event) => {
  const link = event.target.closest("[data-slug]");
  if (!link) return;
  event.preventDefault();
  openPost(link.dataset.slug);
});

filterButtons.forEach((button) => button.addEventListener("click", () => {
  filterButtons.forEach((item) => item.classList.remove("is-active"));
  button.classList.add("is-active");
  renderPosts(button.dataset.filter);
}));

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  navigation.classList.toggle("is-open", !isOpen);
});

navigation.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    menuButton.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
  }
});

dialogClose.addEventListener("click", () => closePost());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closePost();
});
dialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closePost();
});
window.addEventListener("popstate", () => {
  const slug = new URL(window.location.href).searchParams.get("post");
  if (slug) openPost(slug, false);
  else closePost(false);
});

document.querySelector("#year").textContent = new Date().getFullYear();
renderPosts();
const initialPost = new URL(window.location.href).searchParams.get("post");
if (initialPost) openPost(initialPost, false);
