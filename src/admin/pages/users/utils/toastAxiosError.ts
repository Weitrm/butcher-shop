import axios from "axios";
import { toast } from "sonner";

export const toastAxiosError = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    const normalizedMessage = Array.isArray(message) ? message.join(", ") : message;
    toast.error(normalizedMessage || fallbackMessage);
    return;
  }

  toast.error(fallbackMessage);
};
