---
layout: home

# Hero section
hero:
  name: $render.jsx
  text: Cross-platform rendering...
  image:
    src: /render-logo.png
    alt: $render.jsx logo <$>
  tagline: Enjoy stupid-simple JSX in browsers and servers with vanilla JavaScript.
  actions:
    - theme: brand
      text: Get Started
      link: /guide
    - theme: alt
      text: View on GitHub
      link: https://github.com/codingnninja/render/docs

# Features section
features:
  - icon: ⚡️
    title: Faster than them
    details: $render.jsx is faster than all current JavaScript UI frameworks.
  - icon: ⚡️
    title: Client & server rendering
    details: Render UIs in browsers and servers without a virtual DOM or tagged templates.
  - icon: 🎉
    title: No-build JSX
    details: Pre-render UIs with the speed of light on the server.
  - icon: 🔥
    title: Adaptable components
    details: Adapt JSX components to your needs with ease.
  - icon: 🎀
    title: Works everywhere
    details: It works with any JavaScript runtime - client or server.
  - icon: 🎉
    title: Easy integration
    details: It works seamlessly with Ruby, Laravel, Django and others.
  - icon: 🔥
    title: Native SEO & accessibility
    details: No workaround is needed for basic SEO and accessibility. It just works.
  - icon: 🎀
    title: Copy-and-pastable
    details: Copy and paste components and utilities without stress.

# Meta property
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: $render.jsx docs
  - - meta
    - property: og:image
      content: 
  - - meta
    - property: og:url
      content: https://vitejs.dev/blog/announcing-vite3
  - - meta
    - name: title
      content: $render docs
  - - meta
    - name: twitter:card
      content: https://user-images.githubusercontent.com/62628408/200117602-4b274d14-b1b2-4f61-8dcd-9f9482c677a0.png
  - - link
    - rel: icon
      type: image/svg
      href: logo.svg
---

<!-- Custom home layout -->
<div class="custom-layout">
  <h1>🏀</h1>
  <h1>Custom Layout</h1>
  <p>This section was added using plain HTML and CSS.</p>
  <a href="https://github.com/Evavic44/adocs/blob/main/docs/index.md#custom-layout" target="_blank" class="btn">Source Code</a>
</div>
