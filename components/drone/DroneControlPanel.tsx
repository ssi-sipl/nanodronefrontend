// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { JoystickModal } from "@/components/joystick/JoystickModal";
// import { baseUrl } from "@/lib/config";
// import { Home, RotateCcw, Package, Gamepad2, Loader2 } from "lucide-react";

// interface DroneControlPanelProps {
//   droneId: string | null;
//   areaId: string;
//   usbAddress: string;
// }

// export function DroneControlPanel({ droneId, areaId, usbAddress }: DroneControlPanelProps) {
//   const [joystickOpen, setJoystickOpen] = useState(false);
//   const [pending, setPending] = useState<string | null>(null);

//   const runAction = async (
//     key: string,
//     endpoint: string,
//     extraBody: Record<string, unknown> = {},
//   ): Promise<void> => {
//     if (!droneId) return;
//     setPending(key);
//     try {
//       const res = await fetch(`${baseUrl}${endpoint}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ drone_id: droneId, area_id: areaId, ...extraBody }),
//       });
//       const data = await res.json();
//       alert(data.message);
//     } catch {
//       alert("Command failed. Check connection.");
//     } finally {
//       setPending(null);
//     }
//   };

//   const disabled = !droneId;

//   return (
//     <Card className="border-slate-200 shadow-sm">
//       <CardHeader>
//         <CardTitle className="text-base">Drone Controls</CardTitle>
//       </CardHeader>
//       <CardContent className="grid grid-cols-4 gap-3">
//         <Button
//           variant="outline"
//           className="flex flex-col h-20 gap-1.5 hover:bg-amber-50 hover:border-amber-300"
//           disabled={disabled || pending !== null}
//           onClick={() => runAction("rtl", "/drones/rtl", { usb_address: usbAddress })}
//         >
//           {pending === "rtl" ? (
//             <Loader2 className="w-5 h-5 animate-spin" />
//           ) : (
//             <Home className="w-5 h-5 text-amber-600" />
//           )}
//           <span className="text-xs">RTL</span>
//         </Button>

//         <Button
//           variant="outline"
//           className="flex flex-col h-20 gap-1.5 hover:bg-orange-50 hover:border-orange-300"
//           disabled={disabled || pending !== null}
//           onClick={() => runAction("recall", "/drones/rtl", { usb_address: usbAddress })}
//         >
//           {pending === "recall" ? (
//             <Loader2 className="w-5 h-5 animate-spin" />
//           ) : (
//             <RotateCcw className="w-5 h-5 text-orange-600" />
//           )}
//           <span className="text-xs">Recall</span>
//         </Button>

//         <Button
//           variant="outline"
//           className="flex flex-col h-20 gap-1.5 hover:bg-green-50 hover:border-green-300"
//           disabled={disabled || pending !== null}
//           onClick={() => runAction("drop", "/drones/dropPayload")}
//         >
//           {pending === "drop" ? (
//             <Loader2 className="w-5 h-5 animate-spin" />
//           ) : (
//             <Package className="w-5 h-5 text-green-600" />
//           )}
//           <span className="text-xs">Drop</span>
//         </Button>

//         <Button
//           variant="outline"
//           className="flex flex-col h-20 gap-1.5 hover:bg-blue-50 hover:border-blue-300"
//           disabled={disabled}
//           onClick={() => setJoystickOpen(true)}
//         >
//           <Gamepad2 className="w-5 h-5 text-blue-600" />
//           <span className="text-xs">Joystick</span>
//         </Button>
//       </CardContent>

//       <JoystickModal
//         open={joystickOpen}
//         onOpenChange={setJoystickOpen}
//         droneId={droneId}
//         areaId={areaId}
//         usbAddress={usbAddress}
//       />
//     </Card>
//   );
// }