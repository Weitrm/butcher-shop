import { ChevronUp, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";

type CreateUserToggleProps = {
  isOpen: boolean;
  onToggle: () => void;
};

export const CreateUserToggle = ({ isOpen, onToggle }: CreateUserToggleProps) => (
  <Button
    type="button"
    onClick={onToggle}
    aria-expanded={isOpen}
    aria-controls="admin-user-form"
    className="gap-2"
  >
    {isOpen ? (
      <>
        <ChevronUp className="h-4 w-4" />
        Ocultar formulario
      </>
    ) : (
      <>
        <UserPlus className="h-4 w-4" />
        Nuevo usuario
      </>
    )}
  </Button>
);
