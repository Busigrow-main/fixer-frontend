import { API_URL } from "@/app/config";

export default function EmailPreviewPage() {
  const src = `${API_URL}/email-preview`;
  return (
    <iframe
      title="Fixxer email samples"
      src={src}
      style={{ width: "100%", minHeight: "100vh", border: 0, background: "#FAFAFA" }}
    />
  );
}
