import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import SalesFunnelPage from './components/SalesFunnelPage';
import LeadsFunnelPage from './components/LeadsFunnelPage';
import ProposalsPage from './components/ProposalsPage';
import ContactsPage from './components/ContactsPage';
import StudentsPage from './components/StudentsPage';
import AccountsPage from './components/AccountsPage';
import TasksPage from './components/TasksPage';

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