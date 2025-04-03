import Home from "./components/pages/home";
import { Navigation } from "./components/navigation";
import { Background } from "./components/background";

export default function Homepage() {
  return (
    <>
      <Background mode="default" />
      <Navigation />
      <Home />
    </>
  );
}
