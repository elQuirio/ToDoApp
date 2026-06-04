import { usersPath, todosPath, preferencesPath, messagesPath } from '../../db.js';
import fs from 'fs';

export function takeDbSnapshot() {

    const originalUsersDb = fs.readFileSync(usersPath, "utf-8");
    const originalTodosDb = fs.readFileSync(todosPath, "utf-8");
    const originalPreferencesDb = fs.readFileSync(preferencesPath, "utf-8");
    const originalMessagesDb = fs.readFileSync(messagesPath, "utf-8");

    return {originalUsersDb, originalTodosDb, originalPreferencesDb, originalMessagesDb};

}

export function restoreDbSnapshot(dbSnapshot) {
    const {originalUsersDb, originalTodosDb, originalPreferencesDb, originalMessagesDb} = dbSnapshot;

    fs.writeFileSync(usersPath, originalUsersDb);
    fs.writeFileSync(todosPath, originalTodosDb);
    fs.writeFileSync(preferencesPath, originalPreferencesDb);
    fs.writeFileSync(messagesPath, originalMessagesDb);
};