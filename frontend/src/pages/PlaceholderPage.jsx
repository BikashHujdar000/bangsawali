import AppLayout from "../layouts/AppLayout";
import Card from "../components/ui/Card";

export default function PlaceholderPage({ title }) {
  return (
    <AppLayout>
      <Card title={title} />
    </AppLayout>
  );
}
