import {BrowserRouter, Navigate, Route, Routes} from "react-router"

import {WorkbenchPage} from "@/pages/WorkbenchPage"

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/workbench" element={<WorkbenchPage />} />
        <Route path="*" element={<Navigate to="/workbench" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
