import type { Response } from "express";

const clients = new Map<string, Set<Response>>();

export function addClient(userId: string, res: Response) {
  if (!clients.has(userId)) clients.set(userId, new Set());
  clients.get(userId)!.add(res);

  res.on("close", () => {
    const set = clients.get(userId);
    if (!set) return;
    set.delete(res);
    if (set.size === 0) clients.delete(userId);
  });
}

export function pushToUser(userId: string, payload: any) {
  const set = clients.get(userId);
  if (!set || set.size === 0) return;

  const data = `data: ${JSON.stringify(payload)}\n\n`;
  for (const res of set) {
    try {
      res.write(data);
    } catch {}
  }
}
