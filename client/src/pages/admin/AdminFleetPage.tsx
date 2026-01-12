import { Outlet } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import AdminSidebar from '../../components/layout/DashboardSidebar';
import AdminFleetManager from '../../components/backend/cars/AdminFleetManager';



export default function AdminFleetPage() {

  return (
    <div className="min-h-screen bg-d-bg flex">
      <AdminSidebar />

      <main className="flex-1 flex flex-col">
        <div className="px-6 pt-4 pb-3">
          <DashboardHeader
            title="Fleet"
            searchPlaceholder="Search Fleet type, id, etc…"
            onSearchChange={() => {}}
          />

          <div className="space-y-6 pt-4">
            <AdminFleetManager />
          </div>
        </div>

        <div className="px-6 pb-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
