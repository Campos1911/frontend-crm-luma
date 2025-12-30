
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import SalesFunnelPage from './pages/SalesFunnelPage';
import LeadsFunnelPage from './pages/LeadsFunnelPage';
import ProposalsPage from './pages/ProposalsPage';
import ContactsPage from './pages/ContactsPage';
import StudentsPage from './pages/StudentsPage';
import AccountsPage from './pages/AccountsPage';
import TasksPage from './pages/TasksPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<SalesFunnelPage />} />
        <Route path="/leads-funnel" element={<LeadsFunnelPage />} />
        <Route path="/proposals" element={<ProposalsPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
