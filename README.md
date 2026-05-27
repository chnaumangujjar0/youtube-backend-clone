# 📺 YouTube Backend

A production-ready, feature-rich **YouTube clone backend** built with **Node.js**, **Express**, and **MongoDB**. This project covers all core backend concepts including authentication, media uploads, subscriptions, likes, comments, playlists, and more — modeled closely after a real-world video platform.

---

## 🔗 Links

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/chnaumangujjar0/Backend-with-JavaScript)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)

---

## 📌 Features

- **User Authentication** — Register, login, logout with JWT access & refresh tokens
- **Avatar & Cover Image Uploads** — Media handled via Cloudinary + Multer
- **Video Management** — Upload, publish, update, delete, and toggle publish status
- **Subscriptions** — Subscribe/unsubscribe to channels; fetch subscriber and subscription lists
- **Likes** — Like/unlike videos, comments, and tweets
- **Comments** — Add, update, and delete comments on videos
- **Playlists** — Create, update, delete playlists; add or remove videos
- **Tweets** — Post, update, and delete short tweets (community posts)
- **Watch History** — Track and retrieve user watch history
- **Dashboard** — Channel stats including views, subscribers, videos, and likes
- **Health Check** — Simple endpoint to verify server status

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB (via Mongoose) |
| Authentication | JWT (Access + Refresh Tokens) |
| Password Hashing | Bcrypt |
| File Uploads | Multer + Cloudinary |
| API Testing | Postman |
| Environment Config | dotenv |

---

## 📁 Project Structure

```
Backend-with-JavaScript/
├── public/
│   └── temp/                  # Temporary local file storage before Cloudinary upload
├── src/
│   ├── controllers/           # Route handler logic
│   │   ├── user.controller.js
│   │   ├── video.controller.js
│   │   ├── comment.controller.js
│   │   ├── like.controller.js
│   │   ├── playlist.controller.js
│   │   ├── subscription.controller.js
│   │   ├── tweet.controller.js
│   │   ├── dashboard.controller.js
│   │   └── healthcheck.controller.js
│   ├── db/
│   │   └── index.js           # MongoDB connection setup
│   ├── middlewares/
│   │   ├── auth.middleware.js  # JWT verification middleware
│   │   └── multer.middleware.js# File upload middleware
│   ├── models/                # Mongoose schemas & models
│   │   ├── user.model.js
│   │   ├── video.model.js
│   │   ├── comment.model.js
│   │   ├── like.model.js
│   │   ├── playlist.model.js
│   │   ├── subscription.model.js
│   │   └── tweet.model.js
│   ├── routes/                # Express routers
│   │   ├── user.routes.js
│   │   ├── video.routes.js
│   │   ├── comment.routes.js
│   │   ├── like.routes.js
│   │   ├── playlist.routes.js
│   │   ├── subscription.routes.js
│   │   ├── tweet.routes.js
│   │   ├── dashboard.routes.js
│   │   └── healthcheck.routes.js
│   ├── utils/
│   │   ├── ApiError.js        # Custom error class
│   │   ├── ApiResponse.js     # Standardized API responses
│   │   ├── asyncHandler.js    # Async error wrapper
│   │   └── cloudinary.js      # Cloudinary upload/delete helpers
│   ├── app.js                 # Express app setup (CORS, middlewares, routes)
│   ├── constants.js           # App-wide constants
│   └── index.js               # Entry point — DB connect + server start
├── .env.example
├── .gitignore
├── .prettierrc
├── .prettierignore
└── package.json
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local instance or MongoDB Atlas)
- Cloudinary account (for media uploads)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/chnaumangujjar0/Backend-with-JavaScript.git
cd Backend-with-JavaScript
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

Create a `.env` file in the root directory:

```env
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net
CORS_ORIGIN=*

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**4. Start the development server**

```bash
npm run dev
```

The server will start at `http://localhost:8000`.

---

## 🔌 API Endpoints

### Auth & Users — `/api/v1/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | ❌ | Register a new user (avatar + cover image) |
| POST | `/login` | ❌ | Login and receive access + refresh tokens |
| POST | `/logout` | ✅ | Logout and clear refresh token |
| POST | `/refresh-token` | ❌ | Issue new access token via refresh token |
| POST | `/change-password` | ✅ | Update current password |
| GET | `/current-user` | ✅ | Get logged-in user details |
| PATCH | `/update-account` | ✅ | Update fullName and email |
| PATCH | `/avatar` | ✅ | Update avatar image |
| PATCH | `/cover-image` | ✅ | Update cover image |
| GET | `/c/:username` | ✅ | Get channel profile with sub count |
| GET | `/history` | ✅ | Get watch history |

### Videos — `/api/v1/videos`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | ✅ | Get all videos (with pagination & search) |
| POST | `/` | ✅ | Upload a new video |
| GET | `/:videoId` | ✅ | Get a single video by ID |
| PATCH | `/:videoId` | ✅ | Update video details / thumbnail |
| DELETE | `/:videoId` | ✅ | Delete a video |
| PATCH | `/toggle/publish/:videoId` | ✅ | Toggle publish status |

### Subscriptions — `/api/v1/subscriptions`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/c/:channelId` | ✅ | Subscribe / unsubscribe a channel |
| GET | `/c/:channelId` | ✅ | Get a channel's subscriber list |
| GET | `/u/:subscriberId` | ✅ | Get channels a user has subscribed to |

### Comments — `/api/v1/comments`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/:videoId` | ✅ | Get all comments on a video |
| POST | `/:videoId` | ✅ | Add a comment to a video |
| PATCH | `/c/:commentId` | ✅ | Update a comment |
| DELETE | `/c/:commentId` | ✅ | Delete a comment |

### Likes — `/api/v1/likes`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/toggle/v/:videoId` | ✅ | Like / unlike a video |
| POST | `/toggle/c/:commentId` | ✅ | Like / unlike a comment |
| POST | `/toggle/t/:tweetId` | ✅ | Like / unlike a tweet |
| GET | `/videos` | ✅ | Get all liked videos |

### Playlists — `/api/v1/playlists`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | ✅ | Create a new playlist |
| GET | `/:playlistId` | ✅ | Get playlist by ID |
| PATCH | `/:playlistId` | ✅ | Update playlist name/description |
| DELETE | `/:playlistId` | ✅ | Delete a playlist |
| POST | `/add/:videoId/:playlistId` | ✅ | Add a video to a playlist |
| DELETE | `/remove/:videoId/:playlistId` | ✅ | Remove a video from a playlist |
| GET | `/user/:userId` | ✅ | Get all playlists of a user |

### Tweets — `/api/v1/tweets`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | ✅ | Create a tweet |
| GET | `/user/:userId` | ✅ | Get all tweets by a user |
| PATCH | `/:tweetId` | ✅ | Update a tweet |
| DELETE | `/:tweetId` | ✅ | Delete a tweet |

### Dashboard — `/api/v1/dashboard`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/stats` | ✅ | Get channel stats (views, subs, videos, likes) |
| GET | `/videos` | ✅ | Get all videos uploaded by the channel |

### Health Check — `/api/v1/healthcheck`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | ❌ | Verify server is running |

---

## 🔐 Authentication Flow

This project uses a **dual-token strategy** for secure session management:

1. **Access Token** — Short-lived (1 day), sent in the `Authorization: Bearer <token>` header.
2. **Refresh Token** — Long-lived (10 days), stored in an HTTP-only cookie and in the database.
3. When the access token expires, the client hits `/refresh-token` with the refresh token to silently obtain a new access token — no re-login required.

---

## ☁️ Media Uploads (Cloudinary)

All media (avatar, cover image, videos, thumbnails) follow this flow:

```
Client → Multer (local /public/temp) → Cloudinary CDN → DB stores Cloudinary URL
```

On deletion, assets are removed from both the database and Cloudinary using the stored `public_id`.

---

## 🧰 Utilities

| Utility | Purpose |
|---|---|
| `ApiError` | Standardized error responses with HTTP status codes |
| `ApiResponse` | Consistent success response structure |
| `asyncHandler` | Wraps async route handlers to forward errors to Express |
| `cloudinary.js` | Upload and delete helpers for Cloudinary integration |

---

## 📦 Key Dependencies

```json
{
  "express": "^4.x",
  "mongoose": "^8.x",
  "jsonwebtoken": "^9.x",
  "bcrypt": "^5.x",
  "cloudinary": "^2.x",
  "multer": "^1.x",
  "cookie-parser": "^1.x",
  "cors": "^2.x",
  "dotenv": "^16.x"
}
```

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 👤 Author

**Ch. Nauman Gujjar**

[![GitHub](https://img.shields.io/badge/GitHub-chnaumangujjar0-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/chnaumangujjar0)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).