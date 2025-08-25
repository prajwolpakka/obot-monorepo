import { useAppSelector } from '../../common/state/hooks';
import { selectUser, selectIsAuthenticated } from '../state/selectors';

export const useAuth = () => {
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return {
    user,
    isAuthenticated,
  };
};
