import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavItem } from '../types';
import { Icon } from './ui/Icon';
import { Avatar } from './ui/Avatar';

interface SidebarProps {
    navItems: NavItem[];
}

const NavLink: React.FC<NavItem> = ({ icon, text, path }) => {
    const location = useLocation();
    const active = location.pathname === path;
    
    const baseClasses = 'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 group';
    const activeClasses = 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary';
    const inactiveClasses = 'text-gray-700 dark:text-gray-300 hover:bg-neutral-200 dark:hover:bg-gray-800';
    const fontClasses = active ? 'font-bold' : 'font-medium';
    
    return (
        <Link to={path} className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}>
            <Icon name={icon} className={`group-hover:scale-105 transition-transform ${active ? 'fill' : ''}`} />
            <p className={`text-sm leading-normal ${fontClasses}`}>{text}</p>
        </Link>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({ navItems }) => {
    return (
        <aside className="hidden md:flex flex-col w-64 border-r border-neutral-100 dark:border-gray-800 bg-background-light dark:bg-background-dark p-4 shrink-0 h-full">
            <div className="flex flex-col justify-between h-full">
                <div className="flex flex-col gap-8">
                    <div className="flex gap-3 items-center">
                        <Avatar 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_4_sfmZC_eeXqcO6IzJpWWqQnnhyDPSVfHGPuzV619QrAH_qIXrjNQAIQkmvMbfkAZp5wNFKjyh658FUIm691dIw-dQNRdNA4ZS9diFXjbGb9vHof8uiHd2XvjvivavMMSzoaVdTjPNmGdikv4tiwRzV6Kl2eBtugGox6eT5RWTid6D1DAsCuWEHCVdgvIDyjN0irCiBjDPtLAv4dobWd7L5HggV9EiLP7Bv3kdN8Da8z4VX_SGRwXcFGJPmvd3QyFIVbRWloM90" 
                            alt="Company Logo" 
                        />
                        <div className="flex flex-col">
                            <h1 className="text-gray-900 dark:text-gray-100 text-base font-bold leading-normal">LUMA</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">CRM</p>
                        </div>
                    </div>
                    <nav className="flex flex-col gap-1">
                        {navItems.map(item => <NavLink key={item.text} {...item} />)}
                    </nav>
                </div>
                <div className="flex flex-col gap-1">
                    <NavLink icon="settings" text="Configurações" path="/settings" />
                    <NavLink icon="help" text="Ajuda" path="/help" />
                </div>
            </div>
        </aside>
    );
};