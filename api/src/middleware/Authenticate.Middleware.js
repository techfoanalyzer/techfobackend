import jwt from "jsonwebtoken";

export const Authenticate = async (req, res, next) => {
    try {
        
        const token = req.cookies?.AccessToken;
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized Access - No Token Provided"
            });
        }
    
       
        const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodeToken;
        next(); 

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};