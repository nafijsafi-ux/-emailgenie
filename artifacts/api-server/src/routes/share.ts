import { Router, type IRouter } from "express";
import { CreateShareBody } from "@workspace/api-zod";

const router: IRouter = Router();

const shareStore = new Map<string, unknown>();

function generateId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

router.post("/share", (req, res) => {
  const parseResult = CreateShareBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  let id = generateId();
  while (shareStore.has(id)) {
    id = generateId();
  }

  shareStore.set(id, parseResult.data.data);
  res.json({ id });
});

router.get("/share/:id", (req, res) => {
  const { id } = req.params;
  const data = shareStore.get(id);
  if (!data) {
    res.status(404).json({ error: "Share not found or expired" });
    return;
  }
  res.json({ data });
});

export default router;
