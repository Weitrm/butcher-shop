import {RouterProvider } from "react-router"
import { appRouter } from "./app.router"


export const CarniceriaApp = () => {
  return (
    <div>
        <RouterProvider router={appRouter} />
    </div>
  )
}
