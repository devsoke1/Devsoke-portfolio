import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminInquiryById } from "@/lib/inquiries/repository";
import InquiryDetailClient from "./InquiryDetailClient";

export const dynamic = "force-dynamic";

type AdminInquiryDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminInquiryDetailPage({
  params,
}: AdminInquiryDetailPageProps) {
  const admin = await requireAdmin();
  const { id } = await params;
  const inquiry = await getAdminInquiryById(id);

  if (!inquiry) {
    notFound();
  }

  return (
    <InquiryDetailClient
      admin={{
        email: admin.email,
        name: admin.name,
        role: admin.role,
      }}
      inquiry={inquiry}
    />
  );
}

