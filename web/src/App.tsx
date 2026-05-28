import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ShowPlan from "./pages/ShowPlan";
import Overview from "./pages/Overview";
import SeatFlows from "./pages/SeatFlows";
import Geography from "./pages/Geography";
import Margins from "./pages/Margins";
import Reserved from "./pages/Reserved";
import ConstituencyDepth from "./pages/ConstituencyDepth";
import DeepInsights from "./pages/DeepInsights";
import Explorer from "./pages/Explorer";
import Methods from "./pages/Methods";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ShowPlan />} />
        <Route path="overview" element={<Overview />} />
        <Route path="flows" element={<SeatFlows />} />
        <Route path="geography" element={<Geography />} />
        <Route path="margins" element={<Margins />} />
        <Route path="reserved" element={<Reserved />} />
        <Route path="depth" element={<ConstituencyDepth />} />
        <Route path="deep" element={<DeepInsights />} />
        <Route path="explorer" element={<Explorer />} />
        <Route path="methods" element={<Methods />} />
      </Route>
    </Routes>
  );
}
