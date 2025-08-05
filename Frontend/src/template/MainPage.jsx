import { useLocation, Outlet } from 'react-router-dom';
import Header from './Header';

const MainPage = () => {
    const location = useLocation();
    const hiddenRoutes = ['/login', '/register'];
    const shouldHideLayout = hiddenRoutes.includes(location.pathname);

    return (
        <>
            {!shouldHideLayout && <Header />}
            <Outlet />
        </>
    );
};

export default MainPage;
