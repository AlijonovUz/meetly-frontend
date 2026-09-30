import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const Layout = () => {
     const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

     return (
          <div className="flex h-screen overflow-hidden">
               <Sidebar setSidebarCollapsed={setSidebarCollapsed} sidebarCollapsed={sidebarCollapsed} />
               <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                    <Navbar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
                    <main className="flex-1 overflow-y-auto bg-[#F8F9FC]">
                         <Outlet />
                    </main>
               </div>
          </div>
     )
}

export default Layout