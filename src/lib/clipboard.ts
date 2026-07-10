import { toast } from "sonner";

function legacyCopy(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(textarea);
  return ok;
}

export function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => {
        if (legacyCopy(text)) {
          toast.success("Copied to clipboard");
        } else {
          toast.error("Failed to copy");
        }
      });
    return;
  }

  if (legacyCopy(text)) {
    toast.success("Copied to clipboard");
  } else {
    toast.error("Failed to copy");
  }
}
