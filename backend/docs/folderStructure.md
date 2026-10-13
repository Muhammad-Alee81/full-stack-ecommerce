src/
│
├── config/
│   ├── db.js
│   ├── redis.js
│   ├── cloudinary.js
│   └── env.js
│
├── models/
│   ├── user.model.js
│   ├── product.model.js
│   ├── category.model.js
│   ├── cart.model.js
│   ├── wishlist.model.js
│   ├── order.model.js
│   ├── review.model.js
│   └── ...
│
├── modules/
│   │
│   ├── auth/
│   │   ├── auth.routes.js
│   │   ├── auth.controller.js
│   │   ├── auth.service.js
│   │   └── auth.validation.js
│   │
│   ├── user/
│   │   ├── user.routes.js
│   │   ├── user.controller.js
│   │   ├── user.service.js
│   │   └── user.validation.js
│   │
│   ├── product/
│   │   ├── product.routes.js
│   │   ├── product.controller.js
│   │   ├── product.service.js
│   │   └── product.validation.js
│   │
│   ├── category/
│   │   ├── category.routes.js
│   │   ├── category.controller.js
│   │   ├── category.service.js
│   │   └── category.validation.js
│   │
│   ├── cart/
│   │   ├── cart.routes.js
│   │   ├── cart.controller.js
│   │   ├── cart.service.js
│   │   └── cart.validation.js
│   │
│   ├── wishlist/
│   │   ├── wishlist.routes.js
│   │   ├── wishlist.controller.js
│   │   └── wishlist.service.js
│   │
│   ├── order/
│   │   ├── order.routes.js
│   │   ├── order.controller.js
│   │   ├── order.service.js
│   │   └── order.validation.js
│   │
│   └── review/
│       ├── review.routes.js
│       ├── review.controller.js
│       ├── review.service.js
│       └── review.validation.js
│
├── middleware/
│   ├── auth.middleware.js
│   ├── admin.middleware.js
│   ├── error.middleware.js
│   ├── rateLimit.middleware.js
│   └── upload.middleware.js
│
├── utils/
│   ├── jwt.js
│   ├── password.js
│   ├── otp.js
│   ├── AppError.js
│   └── catchAsync.js
│
├── jobs/
│   ├── queues/
│   │   └── email.queue.js
│   │
│   └── workers/
│       └── email.worker.js
│
├── app.js
└── server.js




