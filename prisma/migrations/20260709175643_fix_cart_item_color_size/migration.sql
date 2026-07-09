/*
  Warnings:

  - Made the column `color` on table `cart_items` required. This step will fail if there are existing NULL values in that column.
  - Made the column `size` on table `cart_items` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "cart_items" ALTER COLUMN "color" SET NOT NULL,
ALTER COLUMN "color" SET DEFAULT '',
ALTER COLUMN "size" SET NOT NULL,
ALTER COLUMN "size" SET DEFAULT '';
