-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL DEFAULT 'Not specified',
    "picture" TEXT NOT NULL DEFAULT '/uploads/no-user-image.png',
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stores" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "user_id" TEXT,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "images" TEXT[],
    "store_id" TEXT,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- AddForeignKey
ALTER TABLE "public"."stores" ADD CONSTRAINT "stores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
