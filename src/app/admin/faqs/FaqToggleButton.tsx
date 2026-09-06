"use client";

import { useFormStatus } from "react-dom";
import { ToggleLeft, ToggleRight } from "lucide-react";

export default function FaqToggleButton({
  isPublished,
}: {
  isPublished: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="p-2 border border-brand-rose/20 hover:border-brand-rose text-gray-300 hover:text-brand-fg rounded-xl transition-all disabled:cursor-not-allowed disabled:opacity-50"
      title={isPublished ? "Unpublish FAQ" : "Publish FAQ"}
    >
      {isPublished ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
    </button>
  );
}
