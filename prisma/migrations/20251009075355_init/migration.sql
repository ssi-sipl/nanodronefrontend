-- CreateTable
CREATE TABLE "Area" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "area_id" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Drone" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "drone_id" TEXT NOT NULL,
    "area_id" TEXT NOT NULL,
    "areaRef" INTEGER NOT NULL,
    "cameraFeed" TEXT NOT NULL DEFAULT 'rtsp://<user>:<admin>@<ip>:554/{stream url}',
    CONSTRAINT "Drone_areaRef_fkey" FOREIGN KEY ("areaRef") REFERENCES "Area" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sensor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "area_id" TEXT NOT NULL,
    "sensor_id" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Area_area_id_key" ON "Area"("area_id");

-- CreateIndex
CREATE UNIQUE INDEX "Drone_drone_id_key" ON "Drone"("drone_id");

-- CreateIndex
CREATE UNIQUE INDEX "Sensor_sensor_id_key" ON "Sensor"("sensor_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
