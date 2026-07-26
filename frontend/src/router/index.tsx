import {createBrowserRouter, Navigate, RouterProvider} from "react-router"

import {Collections} from "@/pages/Workbench/Collections"
import {Integrations} from "@/pages/Workbench/settings/Integrations"
import {Workbench} from "@/pages/Workbench"

const router = createBrowserRouter([
  {
    path: "/workbench",
    element: <Workbench />,
    children: [
      {
        index: true,
        element: <Navigate to="collections" replace />,
      },
      {
        path: "collections",
        element: <Collections />,
      },
      {
        path: "settings",
        children: [
          {
            index: true,
            element: <Navigate to="integrations" replace />,
          },
          {
            path: "integrations",
            element: <Integrations />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/workbench/collections" replace />,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
