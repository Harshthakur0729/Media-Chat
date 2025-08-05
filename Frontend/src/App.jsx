import React from 'react'
import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainPage from './template/MainPage';
import Login from './pages/Login';
import Sign_up from './pages/Sign_up';
import ResetPassword from './pages/ResetPassword';
import EnterOTP from './pages/EnterOTP';
import AllUserShow from './pages/AllUserShow';
import ChatUI from './pages/Chat';
import UploadImage from './pages/UploadImage';
import Profile from './pages/Profile';
import Auth from './template/Auth';
import GuestRoute from './template/GuestRoute';


const router = createBrowserRouter([
  {
    path: '/login', element: (<GuestRoute><Login /></GuestRoute >)
  },
  { path: '/register', element: (<GuestRoute><Sign_up /></GuestRoute >) },
  { path: "/upload-image", element: (<GuestRoute>< UploadImage /></GuestRoute >) },
  { path: '/forgot-password', element: <ResetPassword /> },
  { path: '/reset-password', element: <EnterOTP /> },
  {
    path: '/',
    element: (
      <Auth>
        <MainPage />
      </Auth>
    ),
    children: [
      { path: "/", element: <AllUserShow /> },
      { path: "/chat/:id", element: <ChatUI /> },
      { path: "/profile", element: <Profile /> }

    ]
  }
]);


const App = () => {
  return (
    <RouterProvider router={router} />
  )
}

export default App