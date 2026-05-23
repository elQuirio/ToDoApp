import { preferencesPath, getDefaultPreferences, patchPreferencesByUserId, getPreferencesByUserID } from '../../db.js';
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

describe('patchPreferencesByUserId', () => {
    test('throws an error when userId is missing', () => {
        expect(() =>  patchPreferencesByUserId()).toThrow('User id is missing')
    });

    test('save and returns correct preference object', () => {
        const userId = crypto.randomUUID();
        const defaultPreferences = getDefaultPreferences(userId);
        const testPreferences = patchPreferencesByUserId(userId, defaultPreferences);
        expect(testPreferences).toEqual(defaultPreferences);
    });
});


describe('getPreferencesByUserID', () => {
    test('throws an error when User Id is missing', () => {
        expect(() => getPreferencesByUserID()).toThrow('User id is missing');
    });

    test('returns default preferences when no user is found', () => {
        const userId = crypto.randomUUID();
        const defaultPreferences =  getDefaultPreferences(userId);
        const testPreferences = getPreferencesByUserID(userId);
        expect(testPreferences).toEqual(defaultPreferences);
    });

    test('returns correct preferences when user is found', () => {
        const userId = crypto.randomUUID();
        const partialPrefs = {sortBy: 'testSorting', sortDirection: 'testDirection', todoViewMode: 'testViewMode'};
        patchPreferencesByUserId(userId, partialPrefs);
        const testPreferences = getPreferencesByUserID(userId);
        expect(testPreferences).toEqual({...getDefaultPreferences(userId), ...partialPrefs});
    })
});


