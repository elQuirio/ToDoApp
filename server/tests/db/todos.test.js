import { todosPath, preferencesPath, readTodos, writeTodo, writeGetSortedTodos, writeAllTodos, clearTodos, getNewPosition, manualResortTodos, sortTodos, patchPreferencesByUserId } from '../../db.js';
import fs, { readFileSync } from 'fs';
import crypto from "crypto";
import { takeDbSnapshot, restoreDbSnapshot } from '../helpers/testDbHelper.js';

let dbSnapshot;

beforeEach(() => {
  dbSnapshot = takeDbSnapshot();
});

afterEach(() => {
  restoreDbSnapshot(dbSnapshot);
});

describe('readTodos', () => {
    test('returns an array', () => {
        const testTodos = readTodos();
        expect(Array.isArray(testTodos)).toBe(true);
    });

    test('returns correct todos', () => {
        const testTodo = [{
                "userId": crypto.randomUUID(),
                "id": crypto.randomUUID(),
                "text": "test 1",
                "status": "active",
                "createdAt": 1773086379576,
                "updatedAt": 1773086379576,
                "toBeCompletedAt": 1773086879576,
                "position": 1
                }]

        fs.writeFileSync(todosPath, JSON.stringify(testTodo, null, 2));
        const testReadTodos = readTodos();
        expect(testReadTodos).toEqual(testTodo);
    });
});


describe('writeTodo', () => {
    test('throws an error when an invalid todo is provided', () => {
        const invalidTodo = [{
                            "userId": crypto.randomUUID(),
                            "text": "test 1",
                            "status": "active",
                            "createdAt": 1773086379576,
                            "updatedAt": 1773086379576,
                            "toBeCompletedAt": 1773086879576,
                            "position": 1
                            }]
        expect(() => writeTodo(invalidTodo)).toThrow('Invalid todo');
    });

    test('correctly updates todo when it exists', () => {
        const userId = crypto.randomUUID();
        const todoId = crypto.randomUUID();
        const toBeUpdatedTodoDb = [{
                "userId": userId,
                "id": todoId,
                "text": "test todo",
                "status": "active",
                "createdAt": 1773086379576,
                "updatedAt": 1773086379576,
                "toBeCompletedAt": 1773086879576,
                "position": 1
                }]

        const updatedTodo = {
                "userId": userId,
                "id": todoId,
                "text": "new test todo updated",
                "status": "completed",
                "createdAt": 1773086379576,
                "updatedAt": 1773086379576,
                "toBeCompletedAt": 1773086879576,
                "position": 1
                }

        fs.writeFileSync(todosPath, JSON.stringify(toBeUpdatedTodoDb, null, 2));
        writeTodo(updatedTodo);
        const testUpdatedTodoDb = JSON.parse(fs.readFileSync(todosPath, "utf-8"));
        expect(testUpdatedTodoDb).toEqual([updatedTodo]);
    });

    test('appends todo when it does not exists', () => {
        const testTodoDb = [{
                "userId": crypto.randomUUID(),
                "id": crypto.randomUUID(),
                "text": "test todo",
                "status": "active",
                "createdAt": 1773086379576,
                "updatedAt": 1773086379576,
                "toBeCompletedAt": 1773086879576,
                "position": 1
                }]

        const newTodo = {
                "userId": crypto.randomUUID(),
                "id": crypto.randomUUID(),
                "text": "new test todo updated",
                "status": "completed",
                "createdAt": 1773086379576,
                "updatedAt": 1773086379576,
                "toBeCompletedAt": 1773086879576,
                "position": 1
                }

        fs.writeFileSync(todosPath, JSON.stringify(testTodoDb, null, 2));
        writeTodo(newTodo);
        const testUpdatedTodoDb = JSON.parse(fs.readFileSync(todosPath, "utf-8"));
        testTodoDb.push(newTodo);
        expect(testUpdatedTodoDb).toEqual(testTodoDb);
    });
});



describe('writeGetSortedTodos', () => {
    test('throws an error when an invalid todo is provided', () => {
        const userId = crypto.randomUUID();
        const testTodo = {
                    "userId": userId,
                    "text": "new test todo updated",
                    "status": "completed",
                    "createdAt": 1773086379576,
                    "updatedAt": 1773086379576,
                    "toBeCompletedAt": 1773086879576,
                    "position": 1
                    }
        expect(() => writeGetSortedTodos(testTodo, userId)).toThrow('Invalid todo');
    });

    test('throws an error when UserId is missing', () => {
        const testTodo = {
                    "userId": crypto.randomUUID(),
                    "id": crypto.randomUUID(),
                    "text": "new test todo updated",
                    "status": "completed",
                    "createdAt": 1773086379576,
                    "updatedAt": 1773086379576,
                    "toBeCompletedAt": 1773086879576,
                    "position": 1
                    }
        expect(() => writeGetSortedTodos(testTodo)).toThrow('User id is required');
    });
    

    test('correctly sorts todos alphabetically in ascending order', () => {
        const userId = crypto.randomUUID();
        const testTodoDb = [
                {
                    userId,
                    id: crypto.randomUUID(),
                    text: 'zeta',
                    status: 'active',
                    createdAt: 3,
                    updatedAt: 3,
                    toBeCompletedAt: 3,
                    position: 3
                },
                {
                    userId,
                    id: crypto.randomUUID(),
                    text: 'alpha',
                    status: 'active',
                    createdAt: 1,
                    updatedAt: 1,
                    toBeCompletedAt: 1,
                    position: 1
                }]

        const newTodo = {
                    userId,
                    id: crypto.randomUUID(),
                    text: 'beta',
                    status: 'active',
                    createdAt: 2,
                    updatedAt: 2,
                    toBeCompletedAt: 2,
                    position: 2
                }

        fs.writeFileSync(todosPath, JSON.stringify(testTodoDb, null, 2));
        patchPreferencesByUserId(userId, {sortBy: 'alpha', sortDirection: 'asc'});

        const sortedTodos = writeGetSortedTodos(newTodo, userId);
        expect(sortedTodos.map((t) => t.text)).toEqual(['alpha','beta','zeta']);
    });


      test('correctly sorts todos by position in descending order', () => {
        const userId = crypto.randomUUID();
        const testTodoDb = [
                {
                    userId,
                    id: crypto.randomUUID(),
                    text: 'zeta',
                    status: 'active',
                    createdAt: 3,
                    updatedAt: 3,
                    toBeCompletedAt: 3,
                    position: 3
                },
                {
                    userId,
                    id: crypto.randomUUID(),
                    text: 'alpha',
                    status: 'active',
                    createdAt: 1,
                    updatedAt: 1,
                    toBeCompletedAt: 1,
                    position: 1
                }]

        const newTodo = {
                    userId,
                    id: crypto.randomUUID(),
                    text: 'beta',
                    status: 'active',
                    createdAt: 2,
                    updatedAt: 2,
                    toBeCompletedAt: 2,
                    position: 2
                }

        fs.writeFileSync(todosPath, JSON.stringify(testTodoDb, null, 2));
        patchPreferencesByUserId(userId, {sortBy: 'manual', sortDirection: 'desc'});

        const sortedTodos = writeGetSortedTodos(newTodo, userId);
        expect(sortedTodos.map((t) => t.position)).toEqual([3,2,1]);
    });

});


describe ('writeAllTodos', () => {
    test('correctly writes a list of todos', () => {
        const userId = crypto.randomUUID();
        const testTodoDb = [
            {
                userId,
                id: crypto.randomUUID(),
                text: 'zeta',
                status: 'active',
                createdAt: 3,
                updatedAt: 3,
                toBeCompletedAt: 3,
                position: 3
            },
            {
                userId,
                id: crypto.randomUUID(),
                text: 'alpha',
                status: 'active',
                createdAt: 1,
                updatedAt: 1,
                toBeCompletedAt: 1,
                position: 1
            }, 
            {
                userId,
                id: crypto.randomUUID(),
                text: 'beta',
                status: 'active',
                createdAt: 2,
                updatedAt: 2,
                toBeCompletedAt: 2,
                position: 2
            }]
        
        writeAllTodos(testTodoDb);
        const writtenTodos = readTodos();
        expect(writtenTodos).toEqual(testTodoDb);
        
    });
});


describe('clearTodos', () => {
    test('returns user active todos after clearing user completed todos', () => {
        const userId = crypto.randomUUID();
        const userTodo1 = {
                userId,
                id: crypto.randomUUID(),
                text: 'zeta',
                status: 'active',
                createdAt: 3,
                updatedAt: 3,
                toBeCompletedAt: 3,
                position: 3
            }

        const userTodo2 =
            {
                userId,
                id: crypto.randomUUID(),
                text: 'beta',
                status: 'completed',
                createdAt: 2,
                updatedAt: 2,
                toBeCompletedAt: 2,
                position: 2
            }

        const otherUserTodo = {
                userId: crypto.randomUUID(),
                id: crypto.randomUUID(),
                text: 'alpha',
                status: 'completed',
                createdAt: 1,
                updatedAt: 1,
                toBeCompletedAt: 1,
                position: 1
            }
        
        writeAllTodos([userTodo1, userTodo2, otherUserTodo]);
        const clearedTodos = clearTodos(userId, 'completed')
        expect(clearedTodos).toEqual([userTodo1]);
    });

    test('correctly save user active todos after clearing user completed todos', () => {
        const userId = crypto.randomUUID();
        const userTodo1 = {
                userId,
                id: crypto.randomUUID(),
                text: 'zeta',
                status: 'active',
                createdAt: 3,
                updatedAt: 3,
                toBeCompletedAt: 3,
                position: 3
            }

        const userTodo2 =
            {
                userId,
                id: crypto.randomUUID(),
                text: 'beta',
                status: 'completed',
                createdAt: 2,
                updatedAt: 2,
                toBeCompletedAt: 2,
                position: 2
            }

        const otherUserTodo = {
                userId: crypto.randomUUID(),
                id: crypto.randomUUID(),
                text: 'alpha',
                status: 'completed',
                createdAt: 1,
                updatedAt: 1,
                toBeCompletedAt: 1,
                position: 1
            }
        
        writeAllTodos([userTodo1, userTodo2, otherUserTodo]);
        clearTodos(userId, 'completed')
        const testTodoDb = readTodos();
        expect(testTodoDb).toEqual([userTodo1, otherUserTodo]);
    });
    
    test('only clears user todos when clearing all todos', () => {
        const userId = crypto.randomUUID();
        const userTodo1 = {
                userId,
                id: crypto.randomUUID(),
                text: 'zeta',
                status: 'active',
                createdAt: 3,
                updatedAt: 3,
                toBeCompletedAt: 3,
                position: 3
            }

        const userTodo2 =
            {
                userId,
                id: crypto.randomUUID(),
                text: 'beta',
                status: 'completed',
                createdAt: 2,
                updatedAt: 2,
                toBeCompletedAt: 2,
                position: 2
            }

        const otherUserTodo = {
                userId: crypto.randomUUID(),
                id: crypto.randomUUID(),
                text: 'alpha',
                status: 'completed',
                createdAt: 1,
                updatedAt: 1,
                toBeCompletedAt: 1,
                position: 1
            }
        
        writeAllTodos([userTodo1, userTodo2, otherUserTodo]);
        clearTodos(userId, 'all');
        const testTodoDb = readTodos();
        expect(testTodoDb).toEqual([otherUserTodo]);
    });
});


describe('getNewPosition', () => {
    test('throws an error when no userId is provided', () => {
        expect(() => getNewPosition()).toThrow('User id is missing');
    });

    test('correctly return a new todo position', () => {
        const userId = crypto.randomUUID();
        const testTodos = [{
                userId,
                id: crypto.randomUUID(),
                text: 'zeta',
                status: 'active',
                createdAt: 3,
                updatedAt: 3,
                toBeCompletedAt: 3,
                position: 3
            },
            {
                userId,
                id: crypto.randomUUID(),
                text: 'beta',
                status: 'completed',
                createdAt: 2,
                updatedAt: 2,
                toBeCompletedAt: 2,
                position: 2
            },
            {
                userId,
                id: crypto.randomUUID(),
                text: 'alpha',
                status: 'completed',
                createdAt: 1,
                updatedAt: 1,
                toBeCompletedAt: 1,
                position: 1
            }]
        
        writeAllTodos(testTodos);
        const newPosition = getNewPosition(userId);
        expect(newPosition).toEqual(4);
    });
});


describe('manualResortTodos', () => {
    test('throws an error when parameters are missing', () => {
        expect(() => manualResortTodos()).toThrow('Missing parameters');
    });

    test('correctly return sorted todos', () => {
        const userId = crypto.randomUUID();
        const idFrom = crypto.randomUUID();
        const idTo = crypto.randomUUID();
        const idStatic = crypto.randomUUID();
        const userTodo1 = {
                userId,
                id: idFrom,
                text: 'zeta',
                status: 'active',
                createdAt: 3,
                updatedAt: 3,
                toBeCompletedAt: 3,
                position: 3
            }

        const userTodo2 =
            {
                userId,
                id: idStatic,
                text: 'beta',
                status: 'active',
                createdAt: 2,
                updatedAt: 2,
                toBeCompletedAt: 2,
                position: 2
            }

        const userTodo3 =
            {
                userId,
                id: idTo,
                text: 'gamma',
                status: 'active',
                createdAt: 4,
                updatedAt: 4,
                toBeCompletedAt: 4,
                position: 4
            }

        const otherUserTodo = {
                userId: crypto.randomUUID(),
                id: crypto.randomUUID(),
                text: 'alpha',
                status: 'active',
                createdAt: 1,
                updatedAt: 1,
                toBeCompletedAt: 1,
                position: 1
            }
        
        writeAllTodos([userTodo1, userTodo2, userTodo3, otherUserTodo]);
        const sortedTodo = manualResortTodos(idFrom, idTo, userId);
        expect(sortedTodo.map((t) => t.id)).toEqual([idStatic, idTo, idFrom]);
    });

    test('correctly writes sorted todos', () => {
        const userId = crypto.randomUUID();
        const idFrom = crypto.randomUUID();
        const idTo = crypto.randomUUID();
        const idStatic = crypto.randomUUID();
        const idOther = crypto.randomUUID();
        const userTodo1 = {
                userId,
                id: idFrom,
                text: 'zeta',
                status: 'active',
                createdAt: 3,
                updatedAt: 3,
                toBeCompletedAt: 3,
                position: 3
            }

        const userTodo2 =
            {
                userId,
                id: idStatic,
                text: 'beta',
                status: 'completed',
                createdAt: 2,
                updatedAt: 2,
                toBeCompletedAt: 2,
                position: 2
            }

        const userTodo3 =
            {
                userId,
                id: idTo,
                text: 'gamma',
                status: 'active',
                createdAt: 4,
                updatedAt: 4,
                toBeCompletedAt: 4,
                position: 4
            }

        const otherUserTodo = {
                userId: crypto.randomUUID(),
                id: idOther,
                text: 'alpha',
                status: 'active',
                createdAt: 1,
                updatedAt: 1,
                toBeCompletedAt: 1,
                position: 1
            }
        
        writeAllTodos([userTodo1, userTodo2, userTodo3, otherUserTodo]);
        manualResortTodos(idFrom, idTo, userId);
        const todosDb = readTodos();
        expect(todosDb.map((t) => t.id)).toEqual([idTo, idFrom, idStatic, idOther]);
    });

});


describe('sortTodos', () => {
    test('throws and error when required parameter is missing', () => {
        expect(() => sortTodos()).toThrow('Missing parameters');
    });

    test('throws and error when required parameter is wrong', () => {
        expect(() => sortTodos('desc', 'random', crypto.randomUUID())).toThrow('Sort by criteria not valid');
    });

    test('throws and error when sortDirection parameter is wrong', () => {
        expect(() => sortTodos('random', 'manual', crypto.randomUUID())).toThrow("Sort direction must be 'asc' or 'desc'");
    });

    test('correctly returns sorted todos', () => {
        const userId = crypto.randomUUID();
        const idTodo1 = crypto.randomUUID();
        const idTodo2 = crypto.randomUUID();
        const idTodo3 = crypto.randomUUID();
        const idOther = crypto.randomUUID();

        const userTodo1 = {
                userId,
                id: idTodo1,
                text: 'zeta',
                status: 'active',
                createdAt: 3,
                updatedAt: 3,
                toBeCompletedAt: 3,
                position: 3
            }

        const userTodo2 =
            {
                userId,
                id: idTodo2,
                text: 'beta',
                status: 'active',
                createdAt: 2,
                updatedAt: 2,
                toBeCompletedAt: 2,
                position: 2
            }

        const userTodo3 =
            {
                userId,
                id: idTodo3,
                text: 'gamma',
                status: 'active',
                createdAt: 4,
                updatedAt: 4,
                toBeCompletedAt: 4,
                position: 4
            }

        const otherUserTodo = {
                userId: crypto.randomUUID(),
                id: idOther,
                text: 'alpha',
                status: 'active',
                createdAt: 1,
                updatedAt: 1,
                toBeCompletedAt: 1,
                position: 1
            }
        
        writeAllTodos([userTodo1, userTodo2, userTodo3, otherUserTodo]);
        const sortedTodo = sortTodos('desc', 'alpha', userId);
        expect(sortedTodo.map((t) => t.id)).toEqual([idTodo1, idTodo3, idTodo2]);
    });

    test('correctly writes sorted todos', () => {
        const userId = crypto.randomUUID();
        const idTodo1 = crypto.randomUUID();
        const idTodo2 = crypto.randomUUID();
        const idTodo3 = crypto.randomUUID();
        const idOther = crypto.randomUUID();

        const userTodo1 = {
                userId,
                id: idTodo1,
                text: 'zeta',
                status: 'active',
                createdAt: 3,
                updatedAt: 3,
                toBeCompletedAt: 3,
                position: 3
            }

        const userTodo2 =
            {
                userId,
                id: idTodo2,
                text: 'beta',
                status: 'active',
                createdAt: 2,
                updatedAt: 2,
                toBeCompletedAt: 2,
                position: 2
            }

        const userTodo3 =
            {
                userId,
                id: idTodo3,
                text: 'gamma',
                status: 'active',
                createdAt: 4,
                updatedAt: 4,
                toBeCompletedAt: 4,
                position: 4
            }

        const otherUserTodo = {
                userId: crypto.randomUUID(),
                id: idOther,
                text: 'alpha',
                status: 'active',
                createdAt: 1,
                updatedAt: 1,
                toBeCompletedAt: 1,
                position: 1
            }
        
        writeAllTodos([userTodo1, userTodo2, userTodo3, otherUserTodo]);
        sortTodos('desc', 'alpha', userId);
        const todosDb = readTodos();
        expect(todosDb.map((t) => t.id)).toEqual([idTodo1, idTodo3, idTodo2, idOther]);
    });
});