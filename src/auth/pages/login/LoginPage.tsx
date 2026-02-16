import { useNavigate } from "react-router"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { CustomLogo } from "@/components/custom/CustomLogo"
import { useAuthStore } from "@/auth/store/auth.store"

export const LoginPage = () => {

  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isPosting, setIsPosting] = useState(false);

  const handleLogin = async(event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPosting(true);
    const formData = new FormData(event.target as HTMLFormElement);
    const employeeNumber = formData.get('employeeNumber') as string;
    const password = formData.get('password') as string;
    
    const isValid = await login(employeeNumber, password);

    if (isValid) {
      navigate('/');
      return;
    }
    const { lastError } = useAuthStore.getState();
    const message = (() => {
      if (lastError === 'timeout') return 'El servidor tardó demasiado en responder. Espera unos segundos e intenta otra vez.';
      if (lastError === 'invalid') return 'Credenciales inválidas. Revisa tu número de funcionario y contraseña.';
      if (lastError === 'network') return 'No se pudo conectar con el servidor.';
      return 'Error al iniciar sesión. Revisa tus credenciales.';
    })();
    toast.error(message);
    setIsPosting(false);
  }

  return (
    <div className={"flex flex-col gap-6"}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <CustomLogo />
                <p className="text-balance text-muted-foreground">Ingresar a la aplicación</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="employeeNumber">Número de funcionario</Label>
                <Input
                  id="employeeNumber"
                  type="text"
                  name="employeeNumber"
                  placeholder="Ej: 1024"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Contraseña</Label>
                </div>
                <Input id="password" type="password" name="password" required placeholder="Contraseña" />
              </div>
              <Button type="submit" className="w-full" disabled={isPosting}>
                Ingresar
              </Button>
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
