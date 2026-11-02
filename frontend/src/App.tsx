import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import { OverviewDashboard } from './pages/OverviewDashboard';
import { DiscoverPage } from './pages/DiscoverPage';
import { CollectionJobsPage } from './pages/CollectionJobsPage';
import { SourcesPage } from './pages/SourcesPage';
import { ResearchWorkspacePage } from './pages/ResearchWorkspacePage';
import { ToolsWorkspacePage } from './pages/ToolsWorkspacePage';
import { DatasetExplorerPage } from './pages/DatasetExplorerPage';
import { GapBoardPage } from './pages/GapBoardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AutomationPage } from './pages/AutomationPage';
import { SavedItemsPage } from './pages/SavedItemsPage';
import { SettingsPage } from './pages/SettingsPage';
import { UniversalSearchPage } from './pages/UniversalSearchPage';
import { StartupRadarPage } from './pages/StartupRadarPage';
import { AIRadarPage } from './pages/AIRadarPage';
import { BriefingsPage } from './pages/BriefingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30, // 30 seconds
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/overview" replace />} />
            <Route path="overview" element={<OverviewDashboard />} />
            <Route path="discover" element={<DiscoverPage />} />
            <Route path="search" element={<UniversalSearchPage />} />
            <Route path="startups" element={<StartupRadarPage />} />
            <Route path="ai-radar" element={<AIRadarPage />} />
            <Route path="briefings" element={<BriefingsPage />} />
            <Route path="collection" element={<CollectionJobsPage />} />
            <Route path="sources" element={<SourcesPage />} />
            <Route path="research" element={<ResearchWorkspacePage />} />
            <Route path="tools" element={<ToolsWorkspacePage />} />
            <Route path="gaps" element={<GapBoardPage />} />
            <Route path="datasets" element={<DatasetExplorerPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="automation" element={<AutomationPage />} />
            <Route path="saved" element={<SavedItemsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;

