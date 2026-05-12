import AppRoutes from "./app/routes";
import TopLoadingBar from "./components/layout/TopLoadingBar";

export default function App() {
  return (
    <>
      <TopLoadingBar />
      <AppRoutes />
    </>
  );
}
