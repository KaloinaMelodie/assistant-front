// createHybridDb.js
import minimongo from "minimongo";

const RAW = import.meta.env.VITE_I18N_BASE+"/collection" || "http://localhost:8000/v1/collection";
const API_BASE = RAW.replace(/\/+$/, "") + "/";

let singleton;

export async function createHybridDb() {
  if (singleton) return singleton;

  const local = await new Promise((resolve) => {
    const db = new minimongo.IndexedDb(
      { namespace: "chatdb_front", collections: ["conversations", "messages"] },
      () => resolve(db)
    );
  });

  const remote = new minimongo.RemoteDb(API_BASE);
  const hybrid = new minimongo.HybridDb(local, remote, { cacheFind: true, interim: true });

  await new Promise((resolve) => {
    local.addCollection("conversations", () => {
      local.addCollection("messages", () => {
        remote.addCollection("conversations", () => {
          remote.addCollection("messages", () => {
            hybrid.addCollection("conversations", () => {
              hybrid.addCollection("messages", () => resolve());
            });
          });
        });
      });
    });
  });

  singleton = { local, remote, hybrid, BASE: RAW };
  return singleton;
}
