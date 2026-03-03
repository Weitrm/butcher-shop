import { useMemo, useState, type FormEvent, type KeyboardEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2, X } from "lucide-react";

import { createSectorAction, type CreateSectorPayload } from "@/admin/actions/create-sector.action";
import { deleteSectorAction } from "@/admin/actions/delete-sector.action";
import { updateSectorAction } from "@/admin/actions/update-sector.action";
import { AdminTitle } from "@/admin/components/AdminTitle";
import { useAdminProductSlugs } from "@/admin/hooks/useAdminProductSlugs";
import { useAdminSectors } from "@/admin/hooks/useAdminSectors";
import { SectorBadge } from "@/components/custom/SectorBadge";
import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type SectorFormState = {
  title: string;
  color: string;
  isActive: boolean;
  preparationWeekday: number;
  maxTotalKg: string;
  maxItems: string;
  maxOrdersPerWeek: string;
  allowAllProducts: boolean;
  allowedProductSlugs: string[];
};

const weekdayOptions: Array<{ value: number; label: string }> = [
  { value: -1, label: "Todos los dias" },
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miercoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sabado" },
];

const weekdayLabelByValue = new Map(weekdayOptions.map((opt) => [opt.value, opt.label]));

const emptyFormState: SectorFormState = {
  title: "",
  color: "#E2E8F0",
  isActive: true,
  preparationWeekday: 1,
  maxTotalKg: "",
  maxItems: "",
  maxOrdersPerWeek: "",
  allowAllProducts: true,
  allowedProductSlugs: [],
};

const normalizeSlug = (value: string) => value.trim().toLowerCase().replace(/\s+/g, "_");

type SlugTagsInputProps = {
  id: string;
  label: string;
  tags: string[];
  availableSlugs: string[];
  placeholder?: string;
  disabled?: boolean;
  onChange: (next: string[]) => void;
};

const SlugTagsInput = ({
  id,
  label,
  tags,
  availableSlugs,
  placeholder,
  disabled,
  onChange,
}: SlugTagsInputProps) => {
  const [draft, setDraft] = useState("");

  const filteredSuggestions = useMemo(() => {
    const query = normalizeSlug(draft);
    if (!query) return [];
    const selected = new Set(tags);
    return availableSlugs
      .filter((slug) => !selected.has(slug) && slug.includes(query))
      .slice(0, 8);
  }, [availableSlugs, draft, tags]);

  const addSlug = (value: string) => {
    const normalized = normalizeSlug(value);
    if (!normalized) return;
    if (!availableSlugs.includes(normalized)) {
      toast.error("Slug no valido. Selecciona uno de la lista sugerida.");
      return;
    }
    if (tags.includes(normalized)) {
      setDraft("");
      return;
    }
    onChange([...tags, normalized]);
    setDraft("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === "," || event.key === " ") {
      event.preventDefault();
      if (filteredSuggestions.length === 1) {
        addSlug(filteredSuggestions[0]);
        return;
      }
      addSlug(draft);
    }
    if (event.key === "Backspace" && !draft && tags.length > 0) {
      const next = [...tags];
      next.pop();
      onChange(next);
    }
  };

  const handleBlur = () => {
    if (!draft.trim()) return;
    addSlug(draft);
  };

  return (
    <div>
      <label className="text-sm font-medium text-gray-700" htmlFor={id}>
        {label}
      </label>
      <div className="mt-2 rounded-md border border-input bg-background px-2 py-2">
        <div className="mb-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
            >
              {tag}
              <button
                type="button"
                className="leading-none"
                onClick={() => onChange(tags.filter((item) => item !== tag))}
                disabled={disabled}
              >
                x
              </button>
            </span>
          ))}
        </div>
        <Input
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
        />
        {filteredSuggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {filteredSuggestions.map((slug) => (
              <button
                key={slug}
                type="button"
                className="rounded-full border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => addSlug(slug)}
                disabled={disabled}
              >
                {slug}
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Elige slugs existentes. Separadores: espacio, coma o enter.
      </p>
    </div>
  );
};

export const AdminSectorsPage = () => {
  const queryClient = useQueryClient();
  const [editingSectorId, setEditingSectorId] = useState<string | null>(null);
  const [form, setForm] = useState<SectorFormState>(emptyFormState);
  const { data: sectors = [], isLoading: isSectorsLoading } = useAdminSectors();
  const { data: availableSlugs = [], isLoading: isSlugsLoading } = useAdminProductSlugs();

  const createMutation = useMutation({
    mutationFn: createSectorAction,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-sectors"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Sector creado correctamente");
      setForm(emptyFormState);
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string | string[] } } })?.response?.data
          ?.message || "No se pudo crear el sector";
      toast.error(Array.isArray(message) ? message.join(", ") : message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateSectorPayload> }) =>
      updateSectorAction(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-sectors"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-orders-summary"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-orders-history-summary"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Sector actualizado correctamente");
      setEditingSectorId(null);
      setForm(emptyFormState);
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string | string[] } } })?.response?.data
          ?.message || "No se pudo actualizar el sector";
      toast.error(Array.isArray(message) ? message.join(", ") : message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSectorAction,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-sectors"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Sector eliminado correctamente");
    },
    onError: () => {
      toast.error("No se pudo eliminar el sector");
    },
  });

  const submitLabel = useMemo(() => {
    if (createMutation.isPending || updateMutation.isPending) return "Guardando...";
    return editingSectorId ? "Actualizar sector" : "Crear sector";
  }, [createMutation.isPending, editingSectorId, updateMutation.isPending]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim()) {
      toast.error("El nombre del sector es requerido");
      return;
    }

    const payload: CreateSectorPayload = {
      title: form.title.trim(),
      color: form.color,
      isActive: form.isActive,
      preparationWeekday: form.preparationWeekday,
      maxTotalKg: form.maxTotalKg ? Number(form.maxTotalKg) : null,
      maxItems: form.maxItems ? Number(form.maxItems) : null,
      maxOrdersPerWeek: form.maxOrdersPerWeek ? Number(form.maxOrdersPerWeek) : null,
      allowAllProducts: form.allowAllProducts,
      allowedProductSlugs: form.allowedProductSlugs,
    };

    if (editingSectorId) {
      await updateMutation.mutateAsync({ id: editingSectorId, payload });
      return;
    }

    await createMutation.mutateAsync(payload);
  };

  if (isSectorsLoading || isSlugsLoading) {
    return <CustomFullScreenLoading />;
  }

  return (
    <>
      <AdminTitle title="Sectores" subtitle="Gestion de sectores, permisos y productos por slug" />

      <Card className="mb-6">
        <CardContent className="p-5">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Nombre</label>
                <Input
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Ej: Faena"
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Color del sector</label>
                <Input
                  type="color"
                  value={form.color}
                  onChange={(event) => setForm((prev) => ({ ...prev, color: event.target.value }))}
                  className="mt-2 h-10 w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Dia de preparacion</label>
                <select
                  value={form.preparationWeekday}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, preparationWeekday: Number(event.target.value) }))
                  }
                  className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {weekdayOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Max kg total (opcional)</label>
                <Input
                  type="number"
                  min={1}
                  value={form.maxTotalKg}
                  onChange={(event) => setForm((prev) => ({ ...prev, maxTotalKg: event.target.value }))}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Max items</label>
                <Input
                  type="number"
                  min={1}
                  value={form.maxItems}
                  onChange={(event) => setForm((prev) => ({ ...prev, maxItems: event.target.value }))}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Max pedidos/semana
                </label>
                <Input
                  type="number"
                  min={1}
                  value={form.maxOrdersPerWeek}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, maxOrdersPerWeek: event.target.value }))
                  }
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-1">
              <SlugTagsInput
                id="allowed-product-slugs"
                label="Slugs permitidos"
                tags={form.allowedProductSlugs}
                availableSlugs={availableSlugs}
                placeholder="Escribe para buscar y seleccionar"
                onChange={(next) => setForm((prev) => ({ ...prev, allowedProductSlugs: next }))}
                disabled={form.allowAllProducts}
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.allowAllProducts}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, allowAllProducts: event.target.checked }))
                  }
                />
                Permitir todos los productos
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, isActive: event.target.checked }))
                  }
                />
                Sector activo
              </label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {submitLabel}
              </Button>
              {editingSectorId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingSectorId(null);
                    setForm(emptyFormState);
                  }}
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table className="bg-white">
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Dia preparacion</TableHead>
                <TableHead>Limites</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sectors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-gray-500">
                    No hay sectores registrados.
                  </TableCell>
                </TableRow>
              ) : (
                sectors.map((sector) => (
                  <TableRow key={sector.id}>
                    <TableCell>
                      <SectorBadge title={sector.title} color={sector.color} />
                    </TableCell>
                    <TableCell>{weekdayLabelByValue.get(sector.preparationWeekday) || "-"}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {sector.maxTotalKg ? `${sector.maxTotalKg} kg` : "Sin limite kg"} /{" "}
                      {sector.maxItems ? `${sector.maxItems} items` : "Sin limite items"} /{" "}
                      {sector.maxOrdersPerWeek
                        ? `${sector.maxOrdersPerWeek} pedidos/sem`
                        : "Sin limite semanal"}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {sector.allowAllProducts
                        ? "Todos"
                        : `${sector.allowedProductSlugs.length} permitidos`}
                    </TableCell>
                    <TableCell>{sector.isActive ? "Activo" : "Inactivo"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSectorId(sector.id);
                            setForm({
                              title: sector.title,
                              color: sector.color,
                              isActive: sector.isActive,
                              preparationWeekday: sector.preparationWeekday,
                              maxTotalKg: sector.maxTotalKg ? String(sector.maxTotalKg) : "",
                              maxItems: sector.maxItems ? String(sector.maxItems) : "",
                              maxOrdersPerWeek: sector.maxOrdersPerWeek
                                ? String(sector.maxOrdersPerWeek)
                                : "",
                              allowAllProducts: sector.allowAllProducts,
                              allowedProductSlugs: [...(sector.allowedProductSlugs || [])],
                            });
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={deleteMutation.isPending}
                          onClick={async () => {
                            const confirmed = window.confirm(
                              "Eliminar sector? Debe no tener usuarios asignados.",
                            );
                            if (!confirmed) return;
                            await deleteMutation.mutateAsync(sector.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};
