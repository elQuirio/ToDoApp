import jwt from "jsonwebtoken";

export function signToken(userId) {
    if(!userId) throw new Error('User id is missing!');

    const JWT_SECRET = process.env.JWT_SECRET;
    if(!JWT_SECRET) throw new Error('Jwt secret is missing!');

    return jwt.sign({userId}, JWT_SECRET, {expiresIn: '7d'});

}

export function verifyToken(token) {
    if (!token) throw new Error('Token is missing!');

    const JWT_SECRET = process.env.JWT_SECRET;
    if(!JWT_SECRET) throw new Error('Jwt secret is missing!');

    return jwt.verify(token, JWT_SECRET);
}