import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex">
      <div className="flex-1 p-6 bg-white dark:bg-gray-900">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
