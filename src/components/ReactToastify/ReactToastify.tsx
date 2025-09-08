import { toast } from "react-toastify";
import "./_react_toastify.scss";

export const showToastError = (msg: string) =>
  toast.error(
    <div className="popup">
      <div className="popup__title">Error</div>
      <div className="popup__content">{msg}</div>
    </div>
  );
export const showToastInfo = (msg: string) =>
  toast.info(
    <div className="popup">
      <div className="popup__title">Info</div>
      <div className="popup__content">{msg}</div>
    </div>
  );
export const showToastWarning = (msg: string) =>
  toast.warning(
    <div className="popup">
      <div className="popup__title">Warning</div>
      <div className="popup__content">{msg}</div>
    </div>
  );
export const showToastSuccess = (msg: string) =>
  toast.success(
    <div className="popup">
      <div className="popup__title">Success</div>
      <div className="popup__content">{msg}</div>
    </div>
  );
