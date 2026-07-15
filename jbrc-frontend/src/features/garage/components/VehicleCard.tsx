import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VehicleCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>XTS-S10</CardTitle>
        <CardDescription>Rlaarlo &middot; 1/10</CardDescription>
      </CardHeader>
      <CardContent>
        <img
          className="w-full aspect-square object-cover bg-accent rounded-xl"
          src="src/assets/thumbnails/xts-s10_thumbnail.jpeg"
          alt="Vehicle"
        />
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
