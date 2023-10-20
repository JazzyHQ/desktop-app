import { Separator } from '@radix-ui/react-select';
import { Navigate, useLocation } from 'react-router-dom';
import SidebarNav from '~/renderer/components/sidebar-nav';
import ConnectionSettings from './ConnectionSettings';
import QuickActions from './QuickActions';

const sidebarNavItems = [
  {
    href: '/settings/jira/connection',
    title: 'Jira Settings',
    element: ConnectionSettings,
  },
  {
    href: '/settings/jira/quick-actions',
    title: '⚡️ Jira Quick Actions',
    element: QuickActions,
  },
];

export default function JiraSettingsLayout() {
  const location = useLocation();

  const navItem = sidebarNavItems.filter(
    (item) => item.href === location.pathname
  );

  if (navItem.length === 0) {
    return <Navigate to="/" />;
  }
  const matchingNavItem = navItem[0];

  return (
    <>
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Jira Settings</h2>
        <p className="text-muted-foreground">
          Manage your Jira connection settings and create quick actions ⚡️.
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1 lg:max-w-2xl">
          <matchingNavItem.element />
        </div>
      </div>
    </>
  );
}
