"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setAddCategoryDialog } from "@/lib/store/slices/uiSlice";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Tag, ChevronRight } from "lucide-react";
import { deleteCategory } from "@/actions/assets";
import { toast } from "sonner";
import type { Category } from "@/types";
import AddCategoryDialog from "@/components/assets/AddCategoryDialog";

/** Deterministic gradient per category name for the avatar fallback */
const GRADIENTS = [
  "from-blue-400 to-cyan-500",
  "from-violet-400 to-purple-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-pink-400 to-rose-500",
  "from-brand to-brand-dark",
];
function gradientFor(name: string) {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return GRADIENTS[sum % GRADIENTS.length];
}

export default function CategoryPageClient({ categories }: { categories: Category[] }) {
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => s.session.role);
  const [pendingParentId, setPendingParentId] = useState<string | null>(null);

  const totalSub = categories.reduce((acc, c) => acc + c.subCategories.length, 0);

  function openNewCategory(parentId?: string) {
    setPendingParentId(parentId ?? null);
    dispatch(setAddCategoryDialog(true));
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? Assets in this category will be unaffected.`)) return;
    try {
      await deleteCategory(id);
      toast.success(`"${name}" deleted`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete category");
    }
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-5 text-sm text-slate-500">
          <span>
            <strong className="text-slate-900 font-semibold">{categories.length}</strong>{" "}
            top-level
          </span>
          <span>
            <strong className="text-slate-900 font-semibold">{totalSub}</strong>{" "}
            subcategor{totalSub === 1 ? "y" : "ies"}
          </span>
        </div>
        {role === "ADMIN" && (
          <Button
            size="sm"
            onClick={() => openNewCategory()}
            className="rounded-full bg-linear-to-r from-brand to-brand-dark text-white font-semibold shadow-sm shadow-brand/30 hover:shadow-brand/40 gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            New Category
          </Button>
        )}
      </div>

      {/* Grid */}
      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand/8 flex items-center justify-center mb-4">
            <Tag className="h-7 w-7 text-brand" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">No asset categories yet</h3>
          <p className="text-sm text-slate-400 mb-5 max-w-xs">
            Create categories to organise your rental inventory — chairs, tents, lighting, and more.
          </p>
          {role === "ADMIN" && (
            <Button
              onClick={() => openNewCategory()}
              className="rounded-full bg-linear-to-r from-brand to-brand-dark text-white font-semibold gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              New Category
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="group relative rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 p-5 flex flex-col gap-4"
            >
              {/* Delete button — appears on hover */}
              {role === "ADMIN" && (
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  aria-label={`Delete ${cat.name}`}
                  className="absolute top-3 right-3 h-7 w-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Image / avatar */}
              {cat.imageUrl ? (
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              ) : (
                <div
                  className={`w-16 h-16 rounded-xl bg-linear-to-br ${gradientFor(cat.name)} flex items-center justify-center shrink-0`}
                >
                  <span className="text-2xl font-bold text-white select-none">
                    {cat.name[0].toUpperCase()}
                  </span>
                </div>
              )}

              {/* Name + sub count */}
              <div>
                <h3 className="font-semibold text-slate-900 text-sm leading-snug pr-6">{cat.name}</h3>
                {cat.subCategories.length > 0 && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {cat.subCategories.length} subcategor{cat.subCategories.length === 1 ? "y" : "ies"}
                  </p>
                )}
              </div>

              {/* Subcategory list */}
              {cat.subCategories.length > 0 && (
                <ul className="space-y-1.5 border-t border-slate-100 pt-3">
                  {cat.subCategories.map((sub) => (
                    <li key={sub.id} className="flex items-center justify-between group/sub">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <ChevronRight className="h-3 w-3 text-slate-300 shrink-0" />
                        <span className="text-xs text-slate-500 truncate">{sub.name}</span>
                      </div>
                      {role === "ADMIN" && (
                        <button
                          onClick={() => handleDelete(sub.id, sub.name)}
                          aria-label={`Delete ${sub.name}`}
                          className="h-5 w-5 rounded flex items-center justify-center opacity-0 group-hover/sub:opacity-100 text-slate-300 hover:text-red-500 transition-all shrink-0 ml-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {/* Add sub-category shortcut */}
              {role === "ADMIN" && (
                <button
                  onClick={() => openNewCategory(cat.id)}
                  className="mt-auto flex items-center gap-1 text-xs text-brand/70 hover:text-brand transition-colors font-medium pt-1"
                >
                  <Plus className="h-3 w-3" />
                  Add subcategory
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Dialog is colocated here to access pendingParentId state */}
      <AddCategoryDialog
        categories={categories}
        defaultParentId={pendingParentId ?? undefined}
        onClose={() => setPendingParentId(null)}
      />
    </div>
  );
}
