-- CreateTable
CREATE TABLE "guns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "release_date" TIMESTAMP(3),
    "price" INTEGER NOT NULL,
    "used_by" TEXT NOT NULL,
    "damage" TEXT NOT NULL,
    "fire_rate" DOUBLE PRECISION NOT NULL,
    "fire_mode" TEXT NOT NULL,
    "magazine_capacity" INTEGER NOT NULL,
    "max_ammo" INTEGER NOT NULL,
    "reload_time" DOUBLE PRECISION NOT NULL,
    "running_speed" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guns_name_key" ON "guns"("name");
