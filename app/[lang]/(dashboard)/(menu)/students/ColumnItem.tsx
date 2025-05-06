"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Icon } from "@iconify/react";

export const ColumnItem = ({
  id,
  label,
  enabled,
  onToggle,
}: {
  id: string;
  label: string;
  enabled: boolean;
  onToggle: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-2 border rounded-md hover:bg-gray-50"
    >
      <input
        type="checkbox"
        checked={enabled}
        onChange={() => onToggle(id)}
        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
      />
      <span className="flex-1">{label}</span>
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="p-1 text-gray-400 hover:text-gray-600"
        aria-label="Drag handle"
      >
        <Icon icon="heroicons:bars-2" className="h-4 w-4" />
      </button>
    </div>
  );
};