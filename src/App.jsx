import {
  createBrowserRouter,
  RouterProvider,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";

const DirectMeetingRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/join/${id}`} replace />;
};

import {
  Analytics,
  Logs,
  MeetingsPage,
  MeetingDetailPage,
  Profile,
  MeetingsReportPage,
  ParticipantsReportPage,
  OrganizersReportPage,
  Setting,
  Users,
  UserDetailPage,
  LeandingPage,
  NotFoundPage,
  AuthCallbackPage,
  BlockedUserScreen,
  MeetingRoom,
} from "./pages";
import Layout from "./components/Layout/Layout";
import { isAuthenticated, getCurrentUser } from "./services/auth";

/**
 * Admin marshrutlarini himoya qiluvchi komponent.
 * - Foydalanuvchi tizimga kirmagan bo'lsa va "/" ga kirsa: LandingPage ochiladi.
 * - Foydalanuvchi tizimga kirmagan bo'lsa va to'g'ridan-to'g'ri admin panel linklariga o'tmoqchi bo'lsa: 404 (NotFoundPage) ko'rsatiladi.
 * - Foydalanuvchi tizimga kirgan bo'lsa va bloklangan bo'lsa (is_blocked === true): Bloklangan foydalanuvchi sahifasi ochiladi.
 * - Foydalanuvchi tizimga kirgan bo'lsa: Admin paneli (Layout) ochiladi.
 */
const AdminRouteGuard = () => {
  const currentUser = getCurrentUser();
  if (currentUser?.is_blocked) {
    return <BlockedUserScreen />;
  }

  const authed = isAuthenticated();
  const location = useLocation();

  if (!authed) {
    if (location.pathname === "/") {
      return <LeandingPage />;
    }
    return <NotFoundPage />;
  }

  return <Layout />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <AdminRouteGuard />,
    children: [
      {
        index: true,
        element: <Analytics />,
      },
      {
        path: "reports",
        element: <MeetingsReportPage />,
      },
      {
        path: "reports/meetings",
        element: <MeetingsReportPage />,
      },
      {
        path: "reports/participants",
        element: <ParticipantsReportPage />,
      },
      {
        path: "reports/organizers",
        element: <OrganizersReportPage />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "settings",
        element: <Setting />,
      },
      {
        path: "users",
        element: <Users />,
      },
      {
        path: "users/:id",
        element: <UserDetailPage />,
      },
      {
        path: "meetings",
        element: <MeetingsPage />,
      },
      {
        path: "meetings/:id",
        element: <MeetingDetailPage />,
      },
      {
        path: "logs",
        element: <Logs />,
      },
    ],
  },
  {
    path: "/join/:id",
    element: <MeetingRoom />,
  },
  {
    path: "/meeting/:id",
    element: <DirectMeetingRedirect />,
  },
  {
    path: "/leanding",
    element: <LeandingPage />,
  },
  {
    path: "/auth/callback",
    element: <AuthCallbackPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;