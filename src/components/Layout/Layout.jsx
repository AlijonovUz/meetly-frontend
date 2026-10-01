import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import CreateMeetingModal from '../Modals/CreateMeetingModal'

const Layout = () => {
     const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
     const [globalCreateModalOpen, setGlobalCreateModalOpen] = useState(false);

     useEffect(() => {
          const handleOpen = () => setGlobalCreateModalOpen(true);
          window.addEventListener("open-create-meeting-modal", handleOpen);
          return () => window.removeEventListener("open-create-meeting-modal", handleOpen);
     }, []);

     return (
          <div className="flex h-screen overflow-hidden">
               <Sidebar setSidebarCollapsed={setSidebarCollapsed} sidebarCollapsed={sidebarCollapsed} />
               <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                    <Navbar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
                    <main className="flex-1 overflow-y-auto bg-[#F8F9FC]">
                         <Outlet />
                    </main>
               </div>

               <CreateMeetingModal
                    isOpen={globalCreateModalOpen}
                    onClose={() => setGlobalCreateModalOpen(false)}
               />
          </div>
     )
}

export default Layout