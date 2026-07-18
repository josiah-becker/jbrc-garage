import H1 from "@/components/H1";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Parts from "./Parts";

export default function Inventory() {
  return (
    <div className="flex flex-col gap-4">
      <H1>Inventory</H1>
      <Tabs>
        <TabsList variant="line" className="w-full max-w-md">
          <TabsTrigger value="parts">Parts</TabsTrigger>
          <TabsTrigger value="consumables">Consumables</TabsTrigger>
        </TabsList>
        <TabsContent value="parts">
          <Parts />
        </TabsContent>
        <TabsContent value="consumables">
          <p>Consumables content goes here.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
