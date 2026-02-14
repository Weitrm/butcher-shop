import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CreateUserFormCardProps = {
  isVisible: boolean;
  isSubmitting: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

// Tarjeta con el formulario para crear un usuario.
export const CreateUserFormCard = ({
  isVisible,
  isSubmitting,
  onSubmit,
}: CreateUserFormCardProps) => (
  <div
    id="admin-user-form"
    aria-hidden={!isVisible}
    className={`overflow-hidden transition-all duration-300 ease-out ${
      isVisible
        ? "max-h-[800px] opacity-100 translate-y-0"
        : "max-h-0 opacity-0 -translate-y-2 pointer-events-none"
    }`}
  >
    <Card className="max-w-2xl">
      <CardContent className="p-6">
        <form onSubmit={onSubmit}>
          <fieldset disabled={!isVisible} className="space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Nombre completo"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="employeeNumber">Número de funcionario</Label>
              <Input
                id="employeeNumber"
                name="employeeNumber"
                type="text"
                placeholder="Ej: 1024"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nationalId">Cédula</Label>
              <Input
                id="nationalId"
                name="nationalId"
                type="text"
                placeholder="Ej: 12345678"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Contraseña"
                required
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creando..." : "Crear usuario"}
              </Button>
            </div>
          </fieldset>
        </form>
      </CardContent>
    </Card>
  </div>
);
