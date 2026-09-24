import CapturePage from "@/components/CapturePage";

export const metadata = { title: "Ultra Black Lucrativa" };

// Mesma página de captura da home; depois do cadastro vai direto pro check-in
export default function PcPage() {
  return <CapturePage redirectTo="/checkin" />;
}
