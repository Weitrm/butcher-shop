import { useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Sector } from "@/interface/sector.interface";

type CreateUserFormCardProps = {
  isVisible: boolean;
  isSubmitting: boolean;
  sectors: Sector[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export const CreateUserFormCard = ({
  isVisible,
  isSubmitting,
  sectors,
  onSubmit,
  onClose,
}: CreateUserFormCardProps) => {
  useEffect(() => {
    if (!isVisible) return;
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      id="admin-user-form"
      aria-hidden={!isVisible}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <Card
        className="w-[520px] max-w-[calc(100%-2rem)]"
        onClick={(event) => event.stopPropagation()}
      >
        <CardContent className="p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Nuevo funcionario</h3>
              <p className="text-sm text-muted-foreground">
                Completa los datos para crear un usuario.
              </p>
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={onClose}
              aria-label="Cerrar"
            >
              x
            </Button>
          </div>
          <form onSubmit={onSubmit}>
            <fieldset className="space-y-5">
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
                <Label htmlFor="employeeNumber">Numero de funcionario</Label>
                <Input
                  id="employeeNumber"
                  name="employeeNumber"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]+"
                  placeholder="Ej: 1024"
                  onInput={(event) => {
                    event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "");
                  }}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nationalId">Cedula</Label>
                <Input
                  id="nationalId"
                  name="nationalId"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]+"
                  placeholder="Ej: 12345678"
                  onInput={(event) => {
                    event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "");
                  }}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sectorId">Sector</Label>
                <select
                  id="sectorId"
                  name="sectorId"
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  defaultValue=""
                >
                  <option value="">Sin sector</option>
                  {sectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      {sector.title}
                    </option>
                  ))}
                </select>
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
};
