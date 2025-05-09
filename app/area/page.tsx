import { AreaList } from "@/components/area-list";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  return (
    <div className="container py-10 w-full mx-auto px-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Area</h1>
        <Link href="/create">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Add New Area
          </Button>
        </Link>
      </div>

      <AreaList />
    </div>
  );
}
