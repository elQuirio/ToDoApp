import { usersPath, preferencesPath, getDefaultPreferences, getUserByEmail, readUsers, saveNewUser, getUserByUserId, registerNewUser, patchPreferencesByUserId, getPreferencesByUserID } from '../../db.js';
import fs, { readFileSync } from 'fs';
import crypto from "crypto";


describe('getUserByEmail', () => {
    test('throws an error if email is missing', () => {
        expect(() => getUserByEmail()).toThrow('Missing email');
    });

    test('returns null if user not found', () => {
        const user = getUserByEmail(`${crypto.randomUUID()}@email.com`);
        expect(user).toBeNull();
    });

    test('returns the correct user when it exists', () => {
        const newUser = {
            userId: crypto.randomUUID(),
            email: `${crypto.randomUUID()}@email.com`,
            password: 'fakepassword'
        }
        saveNewUser(newUser);
        const testUser = getUserByEmail(newUser.email);
        expect(testUser).toEqual(newUser);
    })
});



describe('readUsers', () => {
    test('returns an array', () => {
        const users = readUsers();
        expect(users).toBeInstanceOf(Array);
    })
});


describe('saveNewUser', () => {
    test('throws an error when no user data is provided', () => {
        expect(() => saveNewUser()).toThrow('Missing user email/id');
    });
    
    test('throws an error when mandatory keys are not provided', () => {
        expect(() => saveNewUser({email: null, userId: null, password:'fakepassword'})).toThrow('Missing user email/id');
    });

    test('user is saved correctly', () => {
        const newUser = {
            userId: crypto.randomUUID(),
            email: `${crypto.randomUUID()}@email.com`,
            password: 'fakepassword'
        }
        const testUser = saveNewUser(newUser);
        expect(testUser).toEqual(newUser);
    });

});


describe ('getUserByUserId', () => {
    test('throws an error when userId is missing', () => {
        expect(() => getUserByUserId()).toThrow('User id is missing');
    });

    test('returns the correct user when it exists', () => {
        const testUser = {
            userId: crypto.randomUUID(),
            email: `${crypto.randomUUID()}@email.com`,
            password: 'fakepassword'
        }
        saveNewUser(testUser);
        const newUser = getUserByUserId(testUser.userId);
        expect(newUser).toEqual(testUser);
    })

    test("return null when user does't exist", () => {
        expect(getUserByUserId(crypto.randomUUID())).toBeNull();
    })
});


describe('registerNewUser', () => {
    test('throws an error when UserId is missing', () => {
        const testUser = {
                email: `${crypto.randomUUID()}@email.com`,
                password: 'fakepassword'
            }
            expect(() => registerNewUser(testUser)).toThrow('User id is missing');
    });

    test('throws an error when saveNewUser fails', () => {
        const testUser = {
                userId: crypto.randomUUID(),
                password: 'fakepassword'
            }
            expect(() => registerNewUser(testUser)).toThrow('Missing user email/id');  
    });

    test('returns the correct user when it is registered correctly', () => {
        const testUser = {
            userId: crypto.randomUUID(),
            email: `${crypto.randomUUID()}@email.com`,
            password: 'fakepassword'
        }
        const newUser = registerNewUser(testUser);
        expect(newUser).toEqual(testUser);
    })
});
