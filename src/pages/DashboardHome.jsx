import React from "react";

export default function DashboardHome() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-indigo-800 mb-6">Welcome to the BrandPeek Admin Dashboard</h2>
        
        <div className="bg-indigo-50 p-6 rounded-lg border-l-4 border-indigo-500">
          <p className="text-gray-700 leading-relaxed">
            This dashboard is your control center for managing the BrandPeek experience. 
            Here, you can add new brands, update existing brand information, and organize 
            rankings — all in one place. The data you manage here is instantly synced with 
            the BrandPeek mobile app, ensuring users always discover the latest and most 
            accurate brand details right from their devices.
          </p>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-indigo-700 mb-2">Brand Management</h3>
            <p className="text-sm text-gray-600">Add and update brand profiles with ease</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-indigo-700 mb-2">Rankings</h3>
            <p className="text-sm text-gray-600">Organize and curate brand rankings</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-indigo-700 mb-2">Real-time Sync</h3>
            <p className="text-sm text-gray-600">Instant updates to the mobile app</p>
          </div>
        </div>
      </div>
    </div>
  );
}