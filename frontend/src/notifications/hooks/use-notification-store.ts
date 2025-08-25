import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/common/state/slice";
import { addNotification, removeNotification, clearNotifications } from "../state/notification-slice";

export const useNotificationStore = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state: RootState) => state.notifications?.notifications || []);

  return {
    notifications,
    addNotification: (notification: any) => dispatch(addNotification(notification)),
    removeNotification: (id: string) => dispatch(removeNotification(id)),
    clearNotifications: () => dispatch(clearNotifications()),
  };
};
