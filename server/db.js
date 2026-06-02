import fs, { readFileSync } from 'fs';
import path from "path";


export const todosPath = path.resolve("./src/assets/todos.json");
export const preferencesPath = path.resolve("./src/assets/preferences.json");
export const usersPath = path.resolve("./src/assets/users.json");
export const messagesPath = path.resolve("./src/assets/messages.json");

/////////////////// TODOS ////////////////////////
export const readTodos = () => {
    const data = fs.readFileSync(todosPath, "utf-8");
    return data.trim() ? JSON.parse(data) : [];
};

export const writeTodo = (todo) => {
    const {id} = todo;
    if (!id) throw new Error('Invalid todo');
    const dbTodos = readTodos();
    const index = dbTodos.findIndex((t) => t.id === id);
    if (index !== -1) {
        //update if exists
        dbTodos[index] = todo;
        fs.writeFileSync(todosPath, JSON.stringify(dbTodos, null, 2));
        return todo;
    } else {
        //else append
        dbTodos.push(todo);
        fs.writeFileSync(todosPath, JSON.stringify(dbTodos, null, 2));
        return todo;
    }
};

export const writeGetSortedTodos = (todo, userId) => {
    const {id} = todo;
    if (!id) throw new Error('Invalid todo');
    if (!userId) throw new Error("User id is required");
    writeTodo(todo);
    const { sortDirection, sortBy } = getPreferencesByUserID(userId);
    return sortTodos(sortDirection, sortBy, userId);
};


export const writeAllTodos = (todos) => {
    fs.writeFileSync(todosPath, JSON.stringify(todos, null, 2));
    return todos;
};


export const clearTodos = (userId, status="all") => {
    if (!userId) throw new Error('User id is missing');
    if (status !== 'completed' && status !== 'all') throw new Error('Status not valid');
    if (status==="completed") {
        const dbTodos = readTodos();
        const userTodos = dbTodos.filter((t) => t.status !== "completed" && t.userId === userId);
        const otherTodos = dbTodos.filter((t) => t.userId !== userId);
        fs.writeFileSync(todosPath, JSON.stringify([...userTodos, ...otherTodos], null, 2));
        return userTodos;
    } else if (status === "all") {
        const dbTodos = readTodos();
        const newDbTodos = dbTodos.filter((t) => t.userId !== userId);
        fs.writeFileSync(todosPath, JSON.stringify(newDbTodos, null, 2));
        return [];
    }
};

export const getNewPosition = (userId) => {
    if (!userId) throw new Error('User id is missing');
    const dbTodos = readTodos();
    const userTodos = dbTodos.filter((t)=> t.userId === userId);
    const maxPosition = userTodos.reduce((acc, t) => Math.max(acc, t.position ?? 0), 0);
    return maxPosition +1;
};

export function manualResortTodos(fromId, toId, userId) {
    if (!fromId || !toId || !userId) throw new Error('Missing parameters');
    if (fromId === toId) return;
    const allTodos = readTodos();
    const userTodos = allTodos.filter((t) => t.userId === userId);
    const otherTodos = allTodos.filter((t) => t.userId !== userId);
    const activeTodos = userTodos.filter((t) => t.status === 'active');
    const completedTodos = userTodos.filter((t) => t.status === 'completed');
    const fromIdIndex = activeTodos.findIndex((t) => t.id === fromId);
    let toIdIndex = activeTodos.findIndex((t) => t.id === toId);

    if (fromIdIndex === -1 || toIdIndex === -1) throw new Error("Todo not found");

    const [moved] = activeTodos.splice(fromIdIndex, 1);
    activeTodos.splice(toIdIndex, 0, moved);

    const now = Date.now();
    activeTodos[toIdIndex].updatedAt = now;

    for (let i=0; i<activeTodos.length; i++) {
        activeTodos[i].position = i+1;
    }
    const todosAll = [...activeTodos, ...completedTodos, ...otherTodos];
    writeAllTodos(todosAll);
    return [...activeTodos, ...completedTodos];
};

export function sortTodos(sortDirection, sortBy, userId) {
    const SORTBY_MAP = {
        "manual": "position",
        "createdAt": "createdAt",
        "updatedAt": "updatedAt",
        "alpha": "text"
    }
    const sortMethod = SORTBY_MAP[sortBy];

    if (!sortDirection || !sortBy || !userId) throw new Error('Missing parameters');
    if (!sortMethod) throw new Error('Sort by criteria not valid');
    if (sortDirection != 'asc' && sortDirection != 'desc') throw new Error("Sort direction must be 'asc' or 'desc'");
    
    const allTodos = readTodos();
    const userTodos = allTodos.filter((t)=> t.userId === userId);
    const otherTodos = allTodos.filter((t)=> t.userId !== userId);
    
    userTodos.sort((a, b) => {
        const valA = a[sortMethod];
        const valB = b[sortMethod];
        if (typeof valA === "string") {
            return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
            return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
    });
    const todosAll = [...userTodos, ...otherTodos];
    writeAllTodos(todosAll);
    return [...userTodos];
};


/////////////////// PREFERENCES ////////////////////////

export function readPreferences() {
    const pref = fs.readFileSync(preferencesPath, "utf-8");
    return pref.trim() ? JSON.parse(pref) : [];
};


export function getDefaultPreferences(userId) {
    if (!userId) throw new Error('User id is missing');
    return {userId: userId, sortBy: 'manual', sortDirection: 'asc', isLightMode: true, todoViewMode: 'all', mainView: 'todo' };
};

export function getPreferencesByUserID(userId) {
    if (!userId) throw new Error('User id is missing');
    const defaultPreferences = getDefaultPreferences(userId);
    const pref = readPreferences().find((p) => p.userId === userId);
    if (pref) {
        return {...defaultPreferences, ...pref};
    } else {
        return defaultPreferences;
    }
};

export function getMaxUserId() {
    const preferences = readPreferences();
    const maxUserIdDb = preferences.reduce((acc, p) => Math.max(acc, p.userId ?? 0), 0);
    return maxUserIdDb + 1;
};

export function patchPreferencesByUserId(userId, prefObj) {
    if (!userId) throw new Error('User id is missing');

    const allPref = readPreferences();
    const prefIndex = allPref.findIndex((i) => i.userId === userId);
    if (prefIndex !== -1) {
        const newPref = {...getDefaultPreferences(userId), ...allPref[prefIndex], ...prefObj, userId };
        allPref[prefIndex] = newPref;
        fs.writeFileSync(preferencesPath, JSON.stringify(allPref, null, 2));
        return newPref;
    } else {
        const defaultPreferences = {...getDefaultPreferences(userId), ...prefObj, userId};
        allPref.push(defaultPreferences);
        fs.writeFileSync(preferencesPath, JSON.stringify(allPref, null, 2));
        return defaultPreferences;
    }
};


/////////////////////////////////// AUTH / REGISTRATION //////////////////////////

export function registerNewUser(userInfo) {
    const { userId } = userInfo;
    if (!userId) throw new Error('User id is missing');

    const saved = saveNewUser(userInfo);
    if (!saved) throw new Error('Error saving user');

    const savedPrefs = patchPreferencesByUserId(userId, {});
    if (!savedPrefs) throw new Error('Error saving preferences');

    return saved;
};


export function readUsers() {
    const data = fs.readFileSync(usersPath, "utf-8");
    return data.trim() ? JSON.parse(data) : [];
};


export function getUserByEmail(email) {
    if (!email) throw new Error('Missing email');
    const userData = readUsers();
    return userData.find((u) => u.email === email) || null;
};

export function saveNewUser(userInfo) {
    if (!userInfo || !userInfo.email || !userInfo.userId) throw new Error('Missing user email/id');

    const usersDb = readUsers();
    usersDb.push(userInfo);
    fs.writeFileSync(usersPath, JSON.stringify(usersDb, null, 2));
    return userInfo;
};

export function getUserByUserId(userId){
    if (!userId) throw new Error('User id is missing');

    const userData = readUsers();
    return userData.find((u) => u.userId === userId) || null;
};


/////////////////// MESSAGES ////////////////////////

export function readMessages() {
    const data = fs.readFileSync(messagesPath, "utf-8");
    return data.trim() ? JSON.parse(data) : [];
};

export function getMessagesByUserId(userId) {
    if (!userId) throw new Error('User id is missing!');

    const allMessages = readMessages();
    return allMessages.filter(m => m.userId === userId);
};

export function getMessagesByConversationId(userId, conversationId) {
    if (!userId) throw new Error('User id is missing!');
    if (!conversationId) throw new Error('Conversation id is missing!');
    if (!isValidConversationId(userId, conversationId)) throw new Error('Conversation id is wrong!');

    const allMessages = readMessages();
    return allMessages.filter(m => m.userId === userId && m.conversationId === conversationId);
};


export function isValidConversationId(userId, conversationId) {
    if (!userId) throw new Error('User id is missing!');
    if (!conversationId) throw new Error('Conversation id is missing!');

    const allMessages = readMessages();
    return !allMessages.some(c => (c.conversationId === conversationId && c.userId !== userId));
};

export function getNextMessagePosition(userId, conversationId) {
    if (!userId) throw new Error('User id is missing!');
    if (!conversationId) throw new Error('Conversation id is missing!');
    if (isValidConversationId(userId, conversationId) === false) throw new Error('Conversation id does not belong to user!');

    const messages = getMessagesByUserId(userId).filter((c) => c.conversationId === conversationId);
    const maxPos = messages.reduce((acc, m) => Math.max(acc, m.position ?? 0), 0);

    return maxPos +1;
};

export function appendQuestionAnswer(userId, conversationId, userText, assistantText) {
    if (!userId) throw new Error('User id is missing!');
    if (!conversationId) throw new Error('Conversation id is missing!');
    if (!userText) throw new Error('User message is missing!');
    if (!assistantText) throw new Error('Assistant message is missing!');
    if (isValidConversationId(userId, conversationId) === false) throw new Error('Conversation id does not belong to user!');

    const userMessagePosition = getNextMessagePosition(userId, conversationId);
    const assistantMessagePosition = userMessagePosition +1;

    const userMessage = {userId: userId, role: 'user', messageId: crypto.randomUUID(), conversationId: conversationId, position: userMessagePosition, messageText: userText };
    const assistantMessage = {userId: userId, role: 'assistant', messageId: crypto.randomUUID(), conversationId: conversationId, position: assistantMessagePosition, messageText: assistantText };

    const allMessages = readMessages();

    allMessages.push(userMessage, assistantMessage);
    fs.writeFileSync(messagesPath, JSON.stringify(allMessages, null, 2));

    return [ userMessage, assistantMessage ];
};



/////////////////// SERVICES ////////////////////////

export function getTodosByUserId(userId) {
    if (!userId) throw new Error('getTodosByUserId -> User id is mandatory');
    const allTodos = readTodos();
    return allTodos.filter((t)=> t.userId === userId);
};

export function markAllTodosStatusByUserId(userId, status) {
    if (!userId) throw new Error('Missing user Id');

    if ((status !== 'active') && (status!=='completed')) throw new Error('Status not valid');

    const allTodos = readTodos();
    const userTodos = allTodos.filter((t) => t.userId === userId);
    const otherTodos = allTodos.filter((t) => t.userId !== userId);
    const updatedTodos = userTodos.map(t => {
        if (t.status !== status) {
            return {...t, "status": status, updatedAt: Date.now()}
        } else {
            return t;
        }
    });
    writeAllTodos([...updatedTodos,...otherTodos]);
    return updatedTodos;
};