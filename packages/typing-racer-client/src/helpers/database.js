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
export async function localSaveReplay(playerId, tournamentId, time, file) {
  const result = await dbManager.localSaveReplay(
    playerId,
    tournamentId,
    time,
    file
  );
  return result;
}
export async function clientSaveTournamentReplay(file) {
  const result = await dbManager.clientSaveTournamentReplay(file);
  return result;
}
