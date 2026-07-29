import { FundsExplorer } from "@/components/funds/FundsExplorer";
import { getFunds } from "@/lib/data/repository";

export default function FundsPage() {
  return <FundsExplorer funds={getFunds()} />;
}
