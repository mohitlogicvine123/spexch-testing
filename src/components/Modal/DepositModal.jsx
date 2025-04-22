import React, { useState } from "react";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import {
  fetchDownlineData,
  performTransactionDownline,
} from "../../Services/Downlinelistapi";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setDownlineData } from "../../Store/Slice/downlineSlice";
import { fetchRoles } from "../../Utils/LoginApi";
import { getUserData } from "../../Services/UserInfoApi";
import { fetchUserDataFailure, fetchUserDataStart, fetchUserDataSuccess } from "../../Store/Slice/userInfoSlice";

const DepositModal = ({
  isOpen,
  onClose,
  roleId,
  fetchData,
  userId,
  setRoleId,
  currentPage,
  entriesToShow,
  user,
}) => {
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { userData, error } = useSelector((state) => state.user);
  const [roles, setRoles] = useState([]);
  const dispatch = useDispatch();

  const token = localStorage.getItem("authToken");
  const totalBalance = useSelector((state) => state.balance.totalBalance);

  if (!isOpen) return null;

  const resetState = () => {
    setAmount("");
    setRemark("");
    setPassword("");
  };


   const refreshData = () => {
      dispatch(fetchUserDataStart());
      getUserData()
        .then((data) => {
          console.error("Error fetching user data: Header", { data });
          if (data?.status == 403 || data?.status == 401) {
            localStorage.clear();
            navigate("/");
          }
          if (data && data.data) {
            dispatch(fetchUserDataSuccess(data));
          } else {
            dispatch(fetchUserDataFailure("Invalid data format"));
          }
        })
        .catch((err) => {
          console.error("Error fetching user data: Header", { err });
          dispatch(fetchUserDataFailure(err.message));
        });
    };
  

  const handleTransaction = async (type) => {
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        setLoading(false);
        return;
      }

      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        toast.error("Please enter a valid transaction amount greater than 0.");
        setLoading(false);
        return;
      }

      const requestData = {
        userId,
        amount: parseFloat(amount),
        password,
        description: remark,
      };

      const response = await performTransactionDownline(
        type,
        requestData,
        token
      );

      if (response.success) {
        toast.success(response.message || "Transaction Successful");
        refreshData()
        const rolesArray = await fetchRoles(token);
        if (!Array.isArray(rolesArray) || rolesArray.length === 0) {
          toast.warning("No roles found. Please check your configuration.");
          setLoading(false);
          return;
        }

        const rolesData = rolesArray.map((role) => ({
          role_name: role.role_name,
          role_id: role._id,
        }));
        setRoles(rolesData);

        let roleId = null;
        if (location.pathname.includes("/user-downline-list")) {
          const userRole = rolesData.find((role) => role.role_name === "user");
          roleId = userRole ? userRole.role_id : rolesData[0].role_id;
        } else if (location.pathname.includes("/master-downline-list")) {
          const masterRole = rolesData.find(
            (role) =>{

              const obj ={
                "super-admin":"sub-admin",
                "sub-admin":"white-level",
                "white-level":"super",
                "super":"master"
              }

              return obj[userData?.data?.role_name];

            // if(userData?.data?.role_name == 'super-admin'){
            //   return role.role_name === "sub-admin"
            //  }else if(userData?.data?.role_name == 'sub-admin'){
            //    return role.role_name === "white-level"
            //  }else if(userData?.data?.role_name == 'white-level'){
            //    return role.role_name === "super"
            //  }else if(userData?.data?.role_name == 'white-level'){
            //    return role.role_name === "master"
            //  }
            }
          );
          roleId = masterRole ? masterRole.role_id : rolesData[0].role_id;
          setRoleId(roleId)
        } else {
          toast.warning("Invalid location path. Unable to determine action.");
          setLoading(false);
          return;
        }
        fetchData(roleId); 
        resetState();
          onClose();
        
      } else {
        toast.error(response.message || "Transaction Failed");
      }
    } catch (err) {
      console.error("Error processing transaction:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 flex items-start justify-center bg-gray-500 bg-opacity-50 z-50">
      <div className="bg-white rounded-md sm:mt-12 mt-3 w-[95%] sm:w-[500px]">
        {/* Modal Header */}
        <div className="flex justify-between items-center bg-gradient-blue text-white text-sm font-custom font-semibold w-full rounded-t-md px-2 py-1">
          <span>Banking - MasterBalance:{' '}{userData?.data?.openingBalance}</span>
          <button
            onClick={() => {
              resetState();
              onClose();
            }}
            className="cursor-pointer text-white text-xl"
          >
            &times;
          </button>
        </div>

        <form className="gap-4 flex flex-col p-4">
          <div className="flex justify-between">
            <div className="font-custom font-bold text-[13px]">
              <span className="bg-green-500 text-white px-1 py-0.5 mr-2 rounded font-custom font-bold text-[11px]">
                {user.role_name.toUpperCase()}
              </span>
              {user.username}
            </div>
            <div className="text-[13px] font-custom">
              Client Bal:{" "}
              <span className="font-custom font-bold">
                {new Intl.NumberFormat("en-IN").format(
                  user.totalAvailableBalance || 0
                )}
              </span>
            </div>
          </div>

          <div className="flex sm:flex-row flex-col justify-between sm:gap-0 gap-2 sm:items-center md:w-[80%]">
            <label className="block text-[13px] font-custom font-medium text-gray-700 sm:w-1/3">
              Balance
            </label>
            <div className="sm:w-2/3 flex items-center space-x-2">
              <input
                type="text"
                value={amount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || !isNaN(value)) {
                    setAmount(value);
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-[5px] h-[35px] text-gray-700 outline-none text-[14px]"
              />
            </div>
          </div>

          <div className="flex sm:flex-row flex-col justify-between sm:gap-0 gap-2 sm:items-center md:w-[80%]">
            <label className="block text-[13px] font-custom font-medium text-gray-700 w-1/3">
              Remark
            </label>
            <div className="sm:w-2/3 flex items-center space-x-2">
              <input
                type="text"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Remark.."
                className="w-full p-2 border border-gray-300 outline-none rounded-[5px] h-[35px] text-gray-700 text-[14px]"
              />
            </div>
          </div>

          <div className="flex sm:flex-row flex-col justify-between sm:gap-0 gap-2 sm:items-center md:w-[80%]">
            <label className="block text-[13px] font-custom font-medium text-gray-700 w-1/3">
              Your Password
            </label>
            <div className="relative sm:w-2/3">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border outline-none border-gray-300 rounded-[5px] h-[35px] text-gray-700 text-[14px]"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-blue"
              >
                {showPassword ? (
                  <IoEyeOffOutline size={20} />
                ) : (
                  <IoEyeOutline size={20} />
                )}
              </span>
            </div>
          </div>

          {/* Transaction Buttons */}
          <div className="flex justify-end gap-3 md:mt-7 mt-4">
            <button
              type="button"
              onClick={() => handleTransaction("deposit")}
              disabled={loading || !amount || !password}
              className={`py-2 sm:px-6 px-5 rounded-md text-[14px] text-white font-bold hover:bg-green-600 focus:outline-none ${
                loading || !amount || !password
                  ? "bg-green-500 bg-opacity-50 cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              {loading ? "Processing..." : "Deposit"}
            </button>
            <button
              type="button"
              onClick={() => handleTransaction("withdraw")}
              disabled={loading || !amount || !password}
              className={`py-2 sm:px-6 px-5 rounded-md text-[14px] text-white font-bold hover:bg-red-600 focus:outline-none ${
                loading || !amount || !password
                  ? "bg-red-500 bg-opacity-50 cursor-not-allowed"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              {loading ? "Processing..." : "Withdraw"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepositModal;
