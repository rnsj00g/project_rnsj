# rnsj.site

GitHub Pages에서 동작하는 순수 HTML/CSS/JavaScript 포트폴리오입니다.

## 게시물 추가

`source/scripts/posts.js`의 `portfolioPosts` 배열에 아래 형식으로 항목을 추가하고, 본문 Markdown 파일을 `source/contents`에 저장하세요.

> 현재는 `.md` 파일만 폴더에 추가해도 카드가 자동 생성되지는 않습니다. 정적 GitHub Pages는 폴더의 파일 목록을 브라우저에서 직접 읽을 수 없으므로, Markdown 파일과 `posts.js`의 게시물 정보를 함께 추가해야 합니다.

```js
{
  slug: "post-slug",
  title: "게시물 제목",
  category: "web",
  label: "사이트 개발",
  date: "2026.09.17",
  description: "카드에 표시할 짧은 설명",
  content: "source/contents/post-slug.md",
  accent: "blue"
}
```

- `category`: `web`, `elearning`, `llm`, `thesis` 중 하나
- `accent`: `blue`, `periwinkle`, `indigo`, `violet`, `plum`, `purple`, `cobalt` 중 하나
- 카드를 클릭하면 Markdown 파일을 사이트 내부 읽기 창으로 보여줍니다.
- 수정한 파일을 GitHub에 커밋하고 푸시하면 GitHub Pages에 반영됩니다.

## 폴더 구조

```text
index.html
source/
  styles/    화면 스타일
  scripts/   게시물 목록과 동작
  images/    이미지 파일
  contents/  Markdown 게시물
```

## GitHub Pages 설정

1. 저장소의 **Settings → Pages**로 이동합니다.
2. 배포 소스를 **Deploy from a branch**로 선택합니다.
3. 배포 브랜치와 `/ (root)` 폴더를 선택합니다.
4. **Custom domain**에 `rnsj.site`를 입력합니다.

저장소 루트의 `CNAME` 파일에도 `rnsj.site`가 설정되어 있습니다.
