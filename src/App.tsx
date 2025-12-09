import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./AppLayout";
import CreateNftPage from "./pages/dashboard/create/nft/page";
import CreateHubPage from "./pages/dashboard/create/page";
import CreatePresalePage from "./pages/dashboard/create/presale/page";
import CreateProjectPage from "./pages/dashboard/create/project/page";
import CreateTokenPage from "./pages/dashboard/create/token/page";
import AirdropPage from "./pages/dashboard/tools/airdrop/page";
import TokenLockerPage from "./pages/dashboard/tools/token-locker/page";
import UserDashboardPage from "./pages/dashboard/user/page";
import MarketDetailPage from "./pages/markets/[id]/page";
import MarketsPage from "./pages/markets/page";
import NFTDetailPage from "./pages/nfts/[id]/page";
import NFTsPage from "./pages/nfts/page";
import Home from "./pages/page";
import ProjectDetailPage from "./pages/projects/[id]/page";
import ProjectsPage from "./pages/projects/page";
import RootLayout from "./RootLayout";

function App() {
  return (
    <RootLayout>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard/create" element={<CreateHubPage />} />
            <Route path="/dashboard/create/nft" element={<CreateNftPage />} />
            <Route path="/dashboard/create/presale" element={<CreatePresalePage />} />
            <Route path="/dashboard/create/project" element={<CreateProjectPage />} />
            <Route path="/dashboard/create/token" element={<CreateTokenPage />} />
            <Route path="/dashboard/tools/airdrop" element={<AirdropPage />} />
            <Route path="/dashboard/tools/token-locker" element={<TokenLockerPage />} />
            <Route path="/dashboard/user" element={<UserDashboardPage />} />
            <Route path="/markets" element={<MarketsPage />} />
            <Route path="/markets/:id" element={<MarketDetailPage />} />
            <Route path="/nfts" element={<NFTsPage />} />
            <Route path="/nfts/:id" element={<NFTDetailPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </RootLayout>
  );
}

export default App;
