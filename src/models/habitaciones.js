import mongoose, { Schema } from "mongoose";

const HabitacionSchema = new Schema(
  {
    numero: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
      max: 1000,
    },
    tipo: {
      type: String,
      required: true,
      enum: ["individual", "doble", "matrimonial", "suite", "familiar"],
      lowercase: true,
    },
    reservas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reserva",
      },
    ],
    descripcion: {
      type: String,
      minlength: 10,
      maxlength: 500,
    },
    precio: {
      type: Number,
      required: true,
      min: 0,
    },
    capacidad: {
      type: Number,
      required: true,
      min: 1,
    },
    caracteristicas: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    imagen: {
      type: String,
      trim: true,
      match: /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i,
    },
    piso: {
      type: Number,
      min: 0,
      max: 500,
    },
    metros: {
      type: Number,
      min: 0,
      max: 600,
    },
  },
  {
    timestamps: true,
  },
);

const Habitacion = mongoose.model("Habitacion", HabitacionSchema);

export default Habitacion;
