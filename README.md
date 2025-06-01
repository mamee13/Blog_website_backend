# ✍️ MERN Blog Platform

A fullstack blogging platform where users can create, read, like, comment, and bookmark posts. Admins can manage all posts and users. Built with the **MERN** stack for clean performance and full control.

---

## 🌐 Live Demo

🔗 [View Blog Platform](https://blog-website-steel-iota.vercel.app/)

## 📂 Repository

🔗 [GitHub Source Code](https://github.com/mamee13/blog_website)

---

## ⚙️ Tech Stack

**Frontend:**
- React + Vite
- Tailwind CSS
- Supabase Auth
- Zustand (state management)

**Backend:**
- Node.js + Express
- MongoDB Atlas
- Supabase JWT middleware
- Render (deployment)

---

## ✨ Features

- 🧾 Create and edit blog posts (Markdown supported)
- ❤️ Like / 💬 comment / 🔖 bookmark any post
- 🧑‍💻 Admin dashboard to manage posts and users
- 🔐 Supabase JWT authentication
- 📊 Post analytics (likes, views, comments)
- 🔍 Search and filter blog posts
- 📱 Fully responsive design

---

## 🧠 User Flow

```mermaid
flowchart TD
  A[User signs in via Supabase] --> B[User lands on dashboard]
  B --> C[User browses blog posts]
  C --> D[User likes/comments/bookmarks a post]
  D --> E[Admin reviews flagged or trending content]
