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
import Error401 from './components/auth/Error401';
import Loading from './components/layoutParts/Loading';

type Prop = {
    loadingCurrentUser?: boolean;
};
export default function MainRouter(props: Prop) {
    return (
        <Router>
            <MainLayout>
                {props.loadingCurrentUser ? (
                    <Loading />
                ) : (
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/401" element={<Error401 />} />
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
                )}

            </MainLayout>
        </Router>
    );
}
