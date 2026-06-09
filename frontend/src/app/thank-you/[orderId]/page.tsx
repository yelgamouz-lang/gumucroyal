"use client";

import { ThankYouPageClient } from "@/components/thank-you/ThankYouPageClient";
import { useParams } from "next/navigation";

export default function ThankYouPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  return <ThankYouPageClient orderId={orderId} />;
}
