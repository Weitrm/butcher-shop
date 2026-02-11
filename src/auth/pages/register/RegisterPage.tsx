import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CustomLogo } from "@/components/custom/CustomLogo"
import { useAuthStore } from "@/auth/store/auth.store"



export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [isPosting, setIsPosting] = useState(false);

  const validateForm = (fullName: string, email: string, password: string) => {
    if (!fullName.trim()) return 'El nombre es requerido';
    if (fullName.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres';
    if (!email.trim()) return 'El correo es requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'El correo no es valido';
    if (!password) return 'La contraseña es requerida';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    return null;
  };

  const handleRegister = async(event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPosting(true);

    const formData = new FormData(event.target as HTMLFormElement);
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const errorMessage = validateForm(fullName, email, password);
    if (errorMessage) {
      toast.error(errorMessage);
      setIsPosting(false);
      return;
    }

    const isValid = await register(email, password, fullName);

    if (isValid) {
      navigate('/');
      return;
    }

    toast.error('Error al registrar la cuenta. Revisa tus datos.');
    setIsPosting(false);
  }

  return (
    <div className={"flex flex-col gap-6"}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleRegister}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <CustomLogo />
                <p className="text-balance text-muted-foreground">Crea una nueva cuenta</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fullName">Nombre</Label>
                <Input id="fullName" name="fullName" type="text" placeholder="Nombre completo" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Correo</Label>
                <Input id="email" name="email" type="email" placeholder="mail@google.com" required />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Constraseña</Label>
                </div>
                <Input id="password" name="password" type="password" required placeholder="Constraseña" />
              </div>
              <Button type="submit" className="w-full" disabled={isPosting}>
                Registrarse
              </Button>
              <div className="text-center text-sm">
               ¿Ya tienes una cuenta? {''}
                <Link to="/auth/login" className="underline underline-offset-4">
                  Ingresar
                </Link>
              </div>
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/frigorifico-pando-1.jpg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        Al hacer clic en continuar, aceptas nuestros <a href="#">Términos de servicio</a> y <a href="#">Política de privacidad</a>.
      </div>
    </div>
  )
}

