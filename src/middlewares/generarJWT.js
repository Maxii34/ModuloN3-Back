import jwt from "jsonwebtoken";

const generarjwt = (Usuario, email) => {
    try {
        const payload = { Usuario, email };
        const token = jwt.sign(payload, process.env.SECRETA_JWT, { expiresIn: "1h" });
        return token;
    } catch (error) {
        console.log(error);
        throw new Error("Error al generar el token");
    }
}

export default generarjwt;