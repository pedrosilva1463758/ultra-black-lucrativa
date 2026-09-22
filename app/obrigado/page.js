import { Suspense } from "react";
import ThankYouPage from "@/components/ThankYouPage";

export const metadata = { title: "Inscrição confirmada · Ultra Black Lucrativa", robots: { index: false } };

export default function Obrigado() {
  return (
    <Suspense>
      <ThankYouPage />
    </Suspense>
  );
}
