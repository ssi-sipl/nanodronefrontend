import { SensorForm } from "@/components/sensor/SensorForm";

type EditSensorPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSensorPage({ params }: EditSensorPageProps) {
  const { id } = await params;

  return <SensorForm mode="edit" sensorId={id} />;
}
