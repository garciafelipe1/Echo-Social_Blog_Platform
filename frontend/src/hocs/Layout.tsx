import Navbar from "@/features/navbar";
import Footer from "@/features/footer";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/reducers";
import { UnknownAction } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { useEffect, useState, useCallback } from "react";
import { loadProfile, loadUser } from "@/redux/actions/auth/actions";
import SearchModal from "@/components/search/SearchModal";

interface pageProps {
    children: React.ReactNode
}

export default function Layout({ children }: pageProps) {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const dispatch: ThunkDispatch<any, any, UnknownAction> = useDispatch();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(loadUser());
      dispatch(loadProfile());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchClick = useCallback(() => setSearchOpen(true), []);

    return (
      <div className="min-h-screen bg-white text-gray-900 dark:bg-dark-main dark:text-dark-txt">
        <Navbar onSearchClick={handleSearchClick} />
        <div className="pb-16 md:pb-0">{children}</div>
        <div className="hidden md:block">
          <Footer />
        </div>
        <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      </div>
    );
}
