import prisma from "@/lib/prisma";

export const inventoryService = {
  async getInventory() {
    await this.seedDefaultInventory();
    return await prisma.inventoryItem.findMany({
      orderBy: { name: "asc" }
    });
  },

  async updateInventory(name: string, quantity: number) {
    return await prisma.inventoryItem.upsert({
      where: { name },
      update: { quantity },
      create: { name, quantity },
    });
  },

  async seedDefaultInventory() {
    const count = await prisma.inventoryItem.count();
    if (count === 0) {
      const defaults = [
        { name: "RAM DDR4 8GB (Kingston)", quantity: 15 },
        { name: "SSD SATA 480GB (Crucial)", quantity: 10 },
        { name: "SSD NVMe M.2 500GB", quantity: 8 },
        { name: "Mouse USB (Standard)", quantity: 25 },
        { name: "Keyboard USB (Standard)", quantity: 20 },
        { name: "สาย LAN CAT6 (3 เมตร)", quantity: 30 },
        { name: "Power Supply 600W (Dtech)", quantity: 5 },
      ];
      
      for (const item of defaults) {
        await prisma.inventoryItem.create({ data: item });
      }
    }
  }
};
