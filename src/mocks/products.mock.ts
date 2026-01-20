// Import all product images
import asado from "@/assets/asado.png";
import flap from "@/assets/flap.png";
import hamburguesa from "@/assets/hamburguesa.png";
import carnepicada from "@/assets/carnepicada.png";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  sizes: string[];
  colors: string[];
}

export const products: Product[] = [
  {
    id: "1",
    name: "Asado",
    price: 35,
    image: asado,
    category: "Asados",
    description: "Asado de res de alta calidad, perfecto para parrilladas.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Negro", "Blanco", "Gris"]
  },
  {
    id: "2",
    name: "Vacio Flap",
    price: 85,
    image: flap,
    category: "Asados",
    description: "Vacio de res de alta calidad, perfecto para asados y parrilladas.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Blanco", "Negro", "Gris"]
  },
  {
    id: "3",
    name: "Hamburguesas",
    price: 75,
    image: hamburguesa,
    category: "Procesados",
    description: "Hamburguesas artesanales hechas con carne 100% de res.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Gris", "Negro", "Azul Marino"]
  },
  {
    id: "4",
    name: "Carné Picada",
    price: 150,
    image: carnepicada,
    category: "Procesados",
    description: "Carne picada fresca, ideal para una variedad de recetas.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Negro", "Gris Oscuro"]
  }
];