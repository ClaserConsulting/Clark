// 📁 src/data/icons.js
import { FiHome, FiSettings, FiUser, FiLogOut, FiZap } from "react-icons/fi";
import { HiOutlinePaperAirplane } from "react-icons/hi2";
import { PiPushPinSimpleBold } from "react-icons/pi";
import { HiOutlineBars3 } from "react-icons/hi2";

export const HomeIcon = (props) => <FiHome {...props} />;
export const ConfigIcon = (props) => <FiSettings {...props} />;
export const UserIcon = (props) => <FiUser {...props} />;
export const LogoutIcon = (props) => <FiLogOut {...props} />;
export const UpgradeIcon = (props) => <FiZap {...props} />;

export const PinIcon = (props) => <PiPushPinSimpleBold {...props} />;
export const HamburgerIcon = (props) => <HiOutlineBars3 {...props} />;
