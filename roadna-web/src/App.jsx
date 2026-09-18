import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'

/**
 * App.jsx
 * Root entry component. Wraps the whole app in BrowserRouter.
 * All route definitions live in AppRoutes.jsx.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
