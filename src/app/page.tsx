import Carousel from "@/components/Carousel";
import { slides } from "@/data/photos";

export default function HomePage() {
  return <Carousel slides={slides} />;
}
