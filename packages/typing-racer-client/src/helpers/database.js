import { OrbitDBManager } from "../database/orbitdbmanager";

let dbManager;

export async function getLocalDatabaseManager() {
  dbManager = new OrbitDBManager();
  await dbManager.start();
  return dbManager;
}

export async function getFileFromHash(hash) {
  const result = await dbManager.getFileFromHash(hash);
  return result;
}
