# API Routes

---

## 🔐 Auth Routes
[01] → [POST]   → /api/v1/auth/register  
[02] → [POST]   → /api/v1/auth/login  
[03] → [POST]   → /api/v1/auth/logout  
[04] → [POST]   → /api/v1/auth/refresh  

---

## 📝 Posts Routes
[01] → [POST]   → /api/v1/posts  
[02] → [GET]    → /api/v1/posts  
[03] → [GET]    → /api/v1/posts/:id  
[04] → [DELETE] → /api/v1/posts/:id  
[05] → [PATCH]  → /api/v1/posts/:id  

---

## 💬 Comments Routes
[01] → [POST]   → /api/v1/comments/post/:postId  
[02] → [GET]    → /api/v1/comments/:commentId/post/:postId  
[03] → [PATCH]  → /api/v1/comments/:commentId/post/:postId  
[04] → [DELETE] → /api/v1/comments/:commentId/post/:postId  

---

## 🔁 Replies Routes
[01] → [POST]   → /api/v1/replies/comment/:commentId  
[02] → [GET]    → /api/v1/replies/:replyId/comment/:commentId  
[03] → [PATCH]  → /api/v1/replies/:replyId/comment/:commentId  
[04] → [DELETE] → /api/v1/replies/:replyId/comment/:commentId  