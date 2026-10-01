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
  MeetingsReportPage,
  ParticipantsReportPage,
  OrganizersReportPage,
  Setting,
  Users,
  UserDetailPage,
  LeandingPage,
} from "./pages";
import Layout from "./components/Layout/Layout";

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
        element: <MeetingsReportPage />,
      },
      {
        path: "/reports/meetings",
        element: <MeetingsReportPage />,
      },
      {
        path: "/reports/participants",
        element: <ParticipantsReportPage />,
      },
      {
        path: "/reports/organizers",
        element: <OrganizersReportPage />,
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
  },
  {
    path: "/leanding",
    element: <LeandingPage />
  }
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;