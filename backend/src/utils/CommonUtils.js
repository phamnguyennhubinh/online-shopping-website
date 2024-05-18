import JWT from 'jsonwebtoken'
require('dotenv').config();

let encodeToken = (userId) => {
    return JWT.sign({
        iss: 'Pham Huong',
        sub: userId,
        iat: new Date().getTime(),
        exp: new Date().setDate(new Date().getDate() + 3)
    }, 'JWT_SECRE')
}
module.exports = { encodeToken }