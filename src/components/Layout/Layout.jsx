import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import CreateMeetingModal from '../Modals/CreateMeetingModal'
import RequireOrganizationModal from '../Modals/RequireOrganizationModal'
import { getMyProfile, getCurrentUser } from '../../services/auth'
import { setCurrentUser } from '../../store/slice/referencesSlice'
import BlockedUserScreen from '../../pages/Auth/BlockedUserScreen'

const Layout = () => {
     const dispatch = useDispatch();
     const reduxUser = useSelector((state) => state.references?.currentUser);
     const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
     const [globalCreateModalOpen, setGlobalCreateModalOpen] = useState(false);
     const [currentUserData, setCurrentUserData] = useState(() => getCurrentUser() || {});
     const [requireOrgModalOpen, setRequireOrgModalOpen] = useState(false);
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
                         setCurrentUserData(userData);
                         dispatch(setCurrentUser(userData));

                         const org = (userData.organization || "").trim();
                         if (!org || org === "Tashkilot kiritilmagan") {
                              setRequireOrgModalOpen(true);
                         } else {
                              setRequireOrgModalOpen(false);
                         }
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

     const handleOrgSaved = (newOrg, updatedData) => {
          const merged = { ...currentUserData, ...updatedData, organization: newOrg };
          setCurrentUserData(merged);
          dispatch(setCurrentUser(merged));
          setRequireOrgModalOpen(false);
     };

     useEffect(() => {
          const handleOpen = () => setGlobalCreateModalOpen(true);
          window.addEventListener("open-create-meeting-modal", handleOpen);
          return () => window.removeEventListener("open-create-meeting-modal", handleOpen);
     }, []);

     if (isBlocked) {
          return <BlockedUserScreen />;
     }

     return (
          <div className="flex h-screen overflow-hidden bg-[#F8F9FC] dark:bg-[#0B0F19] text-[#1A1D2E] dark:text-white">
               <Sidebar setSidebarCollapsed={setSidebarCollapsed} sidebarCollapsed={sidebarCollapsed} />
               <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                    <Navbar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
                    <main className="flex-1 overflow-y-auto bg-[#F8F9FC] dark:bg-[#161B22]">
                         <Outlet />
                    </main>
               </div>

               <CreateMeetingModal
                    isOpen={globalCreateModalOpen}
                    onClose={() => setGlobalCreateModalOpen(false)}
               />

               <RequireOrganizationModal
                    isOpen={requireOrgModalOpen}
                    user={currentUserData || reduxUser}
                    onSuccess={handleOrgSaved}
               />
          </div>
     )
}

export default Layout