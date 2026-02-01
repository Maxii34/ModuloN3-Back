import mongoose, { Schema } from "mongoose";

const usuarioSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 50,
    },
    apellido: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
    telefono: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: 10,
      maxLength: 15,
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
    },
    tipo: {
      type: String,
      required: true,
      enum: ["usuario", "admin"],
      default: "usuario",
    },
    
    reservas: [{
      type: Schema.Types.ObjectId,
      ref: "Reserva"
    }],
    
    habitacionAsignada: {
    type: Schema.Types.ObjectId,
    ref: "Habitacion",
    default: null,
  },
  },
  {
    timestamps: true,
  }
);


usuarioSchema.methods.toJSON = function () {
  const usuario = this.toObject();
  delete usuario.password;
  return usuario;
};

const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;

