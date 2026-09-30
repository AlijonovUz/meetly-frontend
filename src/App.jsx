import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { useSelector } from "react-redux";

import {
  Analytics,
  Logs,
  MeetingsPage,
  MeetingDetailPage,
  Profile,
  ReportsPage,
  Setting,
  Users,
  UserDetailPage,
} from "./pages";
import Layout from "./components/Layout/Layout";

// ---- permission helper ----
// const usePermissions = () => {
//   const userPermissions = useSelector((state) => state.references.userPermissions);
//   const permSet = new Set((userPermissions ?? []).map((p) => p.codename));
//   const has = (codename) => permSet.has(codename);
//   const loaded = Array.isArray(userPermissions);
//   return { has, loaded };
// };

// ---- generic guard: checkFn(has) => boolean ----
// const ProtectedRoute = ({ children, checkFn }) => {
//   const { has, loaded } = usePermissions();

//   if (!loaded) return null; // hali yuklanmagan, hech narsa ko'rsatmaymiz

//   const allowed = checkFn ? checkFn(has) : false;
//   return allowed ? children : <Navigate to="/" replace />;
// };

// // ---- root route: permission bo'lsa HomePage, bo'lmasa AIChatPage ----
// const RootPage = () => {
//   const { has, loaded } = usePermissions();

//   if (!loaded) return null;

//   return has("view_dashboard_stats") ? <HomePage /> : <AIChatPage />;
// };

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Analytics />,
      },
      {
        path: "/reports",
        element: <ReportsPage />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/settings",
        element: <Setting />,
      },
      {
        path: "/users",
        element: <Users />,
      },
      {
        path: "/users/:id",
        element: <UserDetailPage />,
      },
      {
        path: "/meetings",
        element: <MeetingsPage />,
      },
      {
        path: "/meetings/:id",
        element: <MeetingDetailPage />,
      },
      {
        path: "/logs",
        element: <Logs />,
      },
    ],
  }
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;