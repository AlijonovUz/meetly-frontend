import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import CreateMeetingModal from '../Modals/CreateMeetingModal'
import { getMyProfile, getCurrentUser } from '../../services/auth'
import { setCurrentUser } from '../../store/slice/referencesSlice'
import BlockedUserScreen from '../../pages/Auth/BlockedUserScreen'

const Layout = () => {
     const dispatch = useDispatch();
     const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
     const [globalCreateModalOpen, setGlobalCreateModalOpen] = useState(false);
     const [isBlocked, setIsBlocked] = useState(() => {
          const u = getCurrentUser();
          return Boolean(u?.is_blocked);
     });

     useEffect(() => {
          getMyProfile()
               .then((userData) => {
                    if (userData) {
                         if (userData.is_blocked) {
                              setIsBlocked(true);
                         }
                         dispatch(setCurrentUser(userData));
                    }
               })
               .catch((err) => {
                    console.error("Foydalanuvchi profilini yuklashda xatolik:", err);
                    const errorCode =
                         err?.response?.data?.error?.errorCode ||
                         err?.response?.data?.errorCode;
                    
                    if (errorCode === "user_blocked" || err?.response?.status === 401) {
                         const userFromErr =
                              err?.response?.data?.error?.details ||
                              err?.response?.data?.data?.user ||
                              err?.response?.data?.user;

                         if (userFromErr) {
                              try {
                                   localStorage.setItem(
                                        "currentUser",
                                        JSON.stringify({ ...userFromErr, is_blocked: true })
                                   );
                              } catch (e) {}
                         } else {
                              try {
                                   const existing = JSON.parse(localStorage.getItem("currentUser") || "{}");
                                   localStorage.setItem(
                                        "currentUser",
                                        JSON.stringify({ ...existing, is_blocked: true })
                                   );
                              } catch (e) {}
                         }
                         setIsBlocked(true);
                    }
               });
     }, [dispatch]);

     useEffect(() => {
          const handleOpen = () => setGlobalCreateModalOpen(true);
          window.addEventListener("open-create-meeting-modal", handleOpen);
          return () => window.removeEventListener("open-create-meeting-modal", handleOpen);
     }, []);

     if (isBlocked) {
          return <BlockedUserScreen />;
     }

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