import { AreaForm } from "@/components/area/AreaForm";

type EditAreaPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditAreaPage({ params }: EditAreaPageProps) {
  const { id } = await params;

  return <AreaForm mode="edit" areaId={id} />;
}
