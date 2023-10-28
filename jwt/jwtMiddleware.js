const jwt = require("jsonwebtoken")
const userModel = require("../Model/userSchema")

const jwtAuth = async (req, res, next) => {
    try {
        const auth_data = req.headers["authorization"];
        if(auth_data === undefined) return res.status(401).json({
            error:"No Token Provide",
            message:"UnAuthorization"
        })

        const token = auth_data.split(" ")[1]

        const verifyToken = jwt.verify(token, process.env.JWT_PASSWORD)

        req.user = verifyToken;

        const findUser = await userModel.findById(req.user.id)
        if(!findUser) return res.status(404).json({message:"Auth User Is Not Found"})
        next()

    } catch (error) {
        console.error("==>", error);
        res.status(401).json({
            error: error.message
        })
    }
}

module.exports = jwtAuth

