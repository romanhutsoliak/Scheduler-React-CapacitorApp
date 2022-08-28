import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Login from './components/auth/Login';
import Logout from './components/auth/Logout';
import Profile from './components/auth/Profile';
import MainLayout from './components/layouts/MainLayout';
import Tasks from './components/pages/Tasks';
import TaskEdit from './components/pages/TaskEdit';
import TaskView from './components/pages/TaskView';
import PrivateRoute from './components/auth/PrivateRoute';
import Home from './components/pages/Home';

export default function MainRouter() {
    return (
        <Router>
            <MainLayout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<PrivateRoute />}>
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="/tasks/create" element={<TaskEdit />} />
                        <Route
                            path="/tasks/:taskId/edit"
                            element={<TaskEdit />}
                        />
                        <Route path="/tasks/:taskId" element={<TaskView />} />
                        <Route path="/logout" element={<Logout />} />
                        <Route path="/profile" element={<Profile />} />
                    </Route>
                </Routes>
            </MainLayout>
        </Router>
    );
}
