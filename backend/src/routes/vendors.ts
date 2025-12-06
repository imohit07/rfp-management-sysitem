import { Router } from "express";
import { prisma } from "../db/client";

export const vendorsRouter = Router();

vendorsRouter.get("/", async (_req, res) => {
  const vendors = await prisma.vendor.findMany({
    orderBy: { name: "asc" }
  });
  res.json(vendors);
});

vendorsRouter.post("/", async (req, res) => {
  const { name, email, phone } = req.body as {
    name?: string;
    email?: string;
    phone?: string;
  };
  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }
  const vendor = await prisma.vendor.create({
    data: { name, email, phone }
  });
  res.status(201).json(vendor);
});

vendorsRouter.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, email, phone } = req.body as {
    name?: string;
    email?: string;
    phone?: string;
  };

  const vendor = await prisma.vendor.update({
    where: { id },
    data: { name, email, phone }
  });
  res.json(vendor);
});

vendorsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await prisma.vendor.delete({ where: { id } });
  res.status(204).send();
});


