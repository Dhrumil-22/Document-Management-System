import React from 'react';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Dashboard</h2>
      <p className="text-gray-600">Welcome to the administrator's dashboard. Here you can manage users, settings, and system configurations.</p>
      {/* Add admin-specific content here */}
    </div>
  );
};
