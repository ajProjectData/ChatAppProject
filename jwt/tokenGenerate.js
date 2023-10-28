const jwt = require("jsonwebtoken")

function generateToken(data) {
    let _id = data._id
    const token = jwt.sign({ id: _id }, process.env.JWT_PASSWORD)
    return token
}

module.exports = generateToken