import { Suspense } from "react";
import LoginContent from "@/components/LoginContent";

export default function LoginPage() {
  return (
    <Suspense fallback={<div />}> 
      <LoginContent />
    </Suspense>
  );
}
