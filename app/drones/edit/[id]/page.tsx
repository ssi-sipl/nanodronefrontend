import { DroneForm } from "@/components/drone/DroneForm";

type EditDronePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditDronePage({ params }: EditDronePageProps) {
  const { id } = await params;

  return <DroneForm mode="edit" droneId={id} />;
}
