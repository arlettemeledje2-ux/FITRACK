"use client";

import { useSearchParams } from "next/navigation";
import CompteForm from "@/app/compte/CompteForm";

export default function AuthMode() {
  const params = useSearchParams();
  return <CompteForm key={params.get("mode") === "inscription" ? "inscription" : "connexion"} mode={params.get("mode") === "inscription" ? "inscription" : "connexion"}/>;
}
