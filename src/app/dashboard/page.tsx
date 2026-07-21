import { getFunds } from "@/lib/data/repository";
import { FundsIndiaHome } from "@/components/dashboard/FundsIndiaHome";

export default function DashboardPage() {
  return <FundsIndiaHome funds={getFunds()} />;
}
