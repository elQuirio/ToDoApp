import { signToken, verifyToken } from "../../utils/auth.js";
import jwt from 'jsonwebtoken';
import fs, { readFileSync } from 'fs';
import { sign } from "crypto";


describe('signToken', () => {
    test('Throws an error when user is missing', () => {
        expect(() => signToken()).toThrow('User id is missing!');
    });

    test('Throws an error when JWT secret is missing', () => {
        const originalSecret = process.env.JWT_SECRET;
        try {
            delete process.env.JWT_SECRET;

            expect(() => signToken('testUserId')).toThrow('Jwt secret is missing!');

        } finally {
            process.env.JWT_SECRET = originalSecret;
        }
    });

    test('Returns a valid token string', () => {
        const userId = 'testUserId';
        const token = signToken(userId);
        const verifiedPayload = verifyToken(token);

        expect(typeof token).toBe('string');
        expect(verifiedPayload.userId).toBe(userId);

    });

});


describe('verifyToken', () => {
    test('Throws an error when token is missing', () => {
        expect(() => verifyToken()).toThrow('Token is missing!')
    });

    test('Throws an error when JWT secret is missing', () => {
        const originalSecret = process.env.JWT_SECRET;
        try {
            delete process.env.JWT_SECRET;

            expect(() => verifyToken('testUserId')).toThrow('Jwt secret is missing!');

        } finally {
            process.env.JWT_SECRET = originalSecret;
        }
    });

    test('Correctly verifies a token', () => {
        const userId = 'testUserId';
        const token = signToken(userId);
        const verifiedPayload = verifyToken(token);

        expect(typeof token).toBe('string');
        expect(verifiedPayload.userId).toBe(userId);
    });

    test('Fails on malformed token', () => {
        
        expect(() => verifyToken('abcd')).toThrow('jwt malformed');
    });

    test('Fails on expired token', () => {

        const expiredToken = jwt.sign({userId: 'testUserId'}, process.env.JWT_SECRET, {expiresIn: -1});
        expect(() => verifyToken(expiredToken)).toThrow('jwt expired');
    });


});
