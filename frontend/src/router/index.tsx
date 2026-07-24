import {createBrowserRouter, Navigate, RouterProvider} from "react-router"

import {Workbench} from "@/pages/Workbench"

const router = createBrowserRouter([
  {
    path: "/workbench",
    element: <Workbench />,
  },
  {
    path: "*",
    element: <Navigate to="/workbench" replace />,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
