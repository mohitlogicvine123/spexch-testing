import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaSortUp, FaSortDown, FaEdit, FaEye } from "react-icons/fa";
import { AiFillDollarCircle } from "react-icons/ai";
import { RiArrowUpDownFill } from "react-icons/ri";
import { MdSettings, MdDelete, MdManageHistory } from "react-icons/md";
import { FaUserAlt } from "react-icons/fa";
import { BsBuildingFillLock } from "react-icons/bs";
import banking from '../../assets/banking-icon.svg';
import pl from '../../assets/profit-loss-icon.svg';
import betHistory from '../../assets/bet-history-icon.svg';
import setting from '../../assets/settting-icon.svg';
import profile from '../../assets/profile-icon.svg';
import sportSetting from '../../assets/sport-setting-icon.svg';
import deleteIcon from '../../assets/delete-icon.svg';
import CreditEditReferenceModal from "../Modal/CreditEditReferanceModal";
import EditExposureLimitModal from "../Modal/EditExposureLimitModal";
import {
  setLoading,
  setError,
  setDownlineData,
  selectDownlineData,
  selectDownlineLoading,
  selectDownlineError,
} from "../../Store/Slice/downlineSlice";
import { useDispatch } from "react-redux";
import axios from "axios";
import { useSelector } from "react-redux";
import { BASE_URL } from "../../Constant/Api";
import {
  deleteData,
  fetchDownlineData,
  fetchUsersByStatus,
  searchDownline,
} from "../../Services/Downlinelistapi";
import {
  fetchallUsers,
  fetchRoles,
  fetchUserDetails,
} from "../../Utils/LoginApi";
import CreditReferenceTransactionModel from "../Modal/CreditReferenceTransactionModel";
import DepositModal from "../Modal/DepositModal";
import SportsSettingsModal from "../Modal/SportsSettings";
import AccountStatus from "../Modal/AccountStatus";
import { toast } from "react-toastify";
import { Link, useLocation } from "react-router-dom";
import { ROUTES_CONST } from "../../Constant/routesConstant";
import UpdatePartnershipModal from "../Modal/UpdatePartnershipModal";
import { ClipLoader } from "react-spinners";
import { resetDeleteState } from "../../Store/Slice/deleteSlice";
import AnimatedLoader from "../MarketAnalysis/components/Animated";

const DownlineList = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [creditReferenceTransactionList, setCreditReferenceTransactionList] =
    useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isExposureModalOpen, setIsExposureModalOpen] = useState(false);
  const [selectedExposureUser, setSelectedExposureUser] = useState(null);
  const [updatePartnership, setUpdatePartnership] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [depositModal, setDepositModal] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [accountStatus, setAccountStatus] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [dataList, setDataList] = useState([]);
  const [users, setUsers] = useState([]);
  const [list,setList] = useState(false);
  const [roles, setRoles] = useState([]);
  const [userList, setUserList] = useState([]);
  const location = useLocation();
  const [roleId, setRoleId] = useState("");
  const [userFetchList, setUserFetchList] = useState([]);
  const [searchData, setSearchData] = useState([]);
  const downlineData = useSelector(selectDownlineData);
  const { userData } = useSelector((state) => state.user);
  const [isNested, setIsNested] = useState(false);
  const loading = useSelector(selectDownlineLoading);
  const error = useSelector(selectDownlineError);
  const { startFetchData } = useSelector((state) => state.downline);
  const navigate = useNavigate();


  const isMasterDownlineList = location.pathname.includes(
    "/master-downline-list"
  );

  const handlePageChange = (direction) => {
    if (totalPages > 0) {
      if (direction === "first") {
        setCurrentPage(1);
      } else if (direction === "last") {
        setCurrentPage(totalPages);
      } else if (direction === "prev" && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else if (direction === "next" && currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    }
  };

  const handleArrowClick = (item) => {
    // console.log("Selected User Data:", item);
    navigate(ROUTES_CONST.MyAccount, {
      state: {
        selectedUser: item,
        selectedPage: "profitLoss",
        userId: item._id,
      },
    });
  };

  const handleHistoryClick = (item) => {
    // console.log("Selected User Data:", item);
    navigate(ROUTES_CONST.MyAccount, {
      state: {
        selectedUser: item,
        selectedPage: "bethistory",
      },
    });
  };

  const handleProfileClick = (item) => {
    // console.log("Selected User Data:", item);
    navigate(ROUTES_CONST.MyAccount, {
      state: {
        selectedUser: item,
        selectedPage: "myProfile",
        userId: item._id,
      },
    });
  };


  useEffect(() => {
    console.log(userFetchList,userList,downlineData,searchData,'098765432098765432876543')
    if(!location?.pathname?.includes('/user-downline-list')){
            let arr = searchTerm?.length
              ? searchData
              : userFetchList?.length > 0
                ? userFetchList
                : userList?.length > 0
                  ? userList
                  : downlineData
            setDataList(arr)
          }else{
            let arr2 = searchTerm?.length
            ? searchData : 
            downlineData
            setDataList(arr2)
          }
  }, [searchData?.length, userFetchList?.length, userList?.length, downlineData?.length,isDeleteModalOpen])

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);


  const handleSearch = async () => {
      try {
        let type = location.pathname?.includes('/master-downline-list') ? '' : 'user'
        const res = await searchDownline(
          `user/get-user?page=1&limit=10&search=${searchTerm}&role=${roleId}${type ? `&type=${type}` : ''}`
        );
        setSearchData(res?.data?.data);
      } catch (error) {
        console.log(error);
      }
    }


  const fetchData = async (roleId) => {
    try {
      // if(roleId){
        console.log("Abcd2");

        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("Token not found. Please log in again.");
          return;
        }
  
        dispatch(setLoading(true));
        let type = location.pathname?.includes('/master-downline-list') ? '' : 'user'
        const result = await fetchDownlineData(
          currentPage,
          entriesToShow,
          roleId,
          '',
          type
        );
  
        if (result && result.data) {
          setDataList(result.data)
          dispatch(setDownlineData(result.data));
          setTotalUsers(result.pagination?.totalUsers || 0);
        }
      // }
    } catch (err) {
      console.error("Error fetching data:", err.message);
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };



  useEffect(() => {
    // if (roleId) {
      const token = localStorage.getItem("authToken");
      const fetchData = async () => {
        console.log("Abcd1",token);
        try {
          if (!token) {
            return;
          }
          
          dispatch(setLoading(true));
          let type = location.pathname?.includes('/master-downline-list') ? '' : 'user'
          const result = await fetchDownlineData(
            currentPage,
            entriesToShow,
            roleId,
            selectedFilter,
            type
          );
          if (result && result.data) {
            setDataList(result.data)
            dispatch(setDownlineData(result.data));
            setTotalUsers(result.pagination?.totalUsers || 0);
          }
        } catch (err) {
          console.log(err,'Abcd1')
          console.error("Error fetching data:", err.message);
          dispatch(setError(err.message));
        } finally {
          dispatch(setLoading(false));
        }
      // };

    }
    fetchData();
  }, [
    currentPage,
    entriesToShow,
    roleId,
    selectedFilter,
    isDeleteModalOpen,
    startFetchData,
    location.pathname,
  ]);

  const filteredData = downlineData.filter((item) =>
    item.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // useEffect(() => {
  //   if (location.pathname.includes("/master-downline-list")) {
  //     console.log("Abcd3");

  //     const fetchUserRoles = async () => {
  //       try {
  //         const token = localStorage.getItem("authToken");
  //         if (token) {
  //           let type1 = location.pathname?.includes('/master-downline-list') ? '' : 'user'
  //           const data12 =   await   fetchDownlineData(1, 10000, '',selectedFilter,type1)
  //           const rolesArray = await fetchRoles(token);
  //           console.log(data12,'data12')
  //           setDataList(data12?.data)
  //           // if (Array.isArray(rolesArray)) {
  //           //   const rolesData = rolesArray.map((role) => ({
  //           //     role_name: role.role_name,
  //           //     role_id: role._id,
  //           //   }));
  //           //   setRoles(rolesData);
              
  //           //   const masterAgentRoles = rolesData.filter(
  //           //     (role) =>
  //           //       role.role_name.toLowerCase() === "master" ||
  //           //     role.role_name.toLowerCase() === "agent" ||
  //           //     role.role_name.toLowerCase() === "sub-admin" ||
  //           //     role.role_name.toLowerCase() === "super" ||
  //           //     role.role_name.toLowerCase() === "white-level"
  //           //   );
              
  //           // //   if (masterAgentRoles.length > 0) {
  //           // //     // Fetch all data for each role without pagination
  //           // //     // const fetchPromises = masterAgentRoles.map((role) =>
  //           // //   // );
              
  //           // //   const results = await Promise.all(fetchPromises);
              
  //           // //   const combinedData = results.flatMap(
  //           // //     (result) => result.data || []
  //           // //   );
  //           // //   console.log("Abcd1",rolesData[0].role_id);
              
  //           // //   const totalUsers = combinedData.length;
  //           // //   console.log(data12,'totalUserstotalUserstotalUserstotalUserstotalUsers')
  //           // //   setTotalUsers(totalUsers);
              
  //           // //   const startIndex = (currentPage - 1) * entriesToShow;
  //           // //   const endIndex = startIndex + entriesToShow;
  //           // //   const paginatedData = combinedData.slice(startIndex, endIndex);
  //           // //   setDataList(paginatedData)
  //           // //   dispatch(setDownlineData(paginatedData));
  //           // // } else if (rolesData.length > 0) {
  //           // //     console.log("Abcd1");
  //           // //     setRoleId(rolesData[0].role_id);
  //           // //   }
  //           // } else {
  //           //   setError("Roles data is not an array.");
  //           // }
  //         }
  //       } catch (error) {
  //         setError(error.message || "Failed to fetch roles.");
  //       }
  //     };
  //     fetchUserRoles();
  //   }
  // }, [token, location.pathname, currentPage,selectedFilter, entriesToShow, dispatch]);

  // useEffect(() => {
  //   if (location.pathname.includes("/user-downline-list")) {
  //     console.log("Abcd3");
  //     const fetchUserRoles = async () => {
  //       console.log("rrrrrruuuuuunnnnnnnn1");
  //       try {
  //         const token = localStorage.getItem("authToken");
  //         if (token) {
  //           const rolesArray = await fetchRoles(token);
  //           if (Array.isArray(rolesArray)) {
  //             const rolesData = rolesArray.map((role) => ({
  //               role_name: role.role_name,
  //               role_id: role._id,
  //             }));
  //             setRoles(rolesData);
  //             // Case-insensitive check for 'user'
  //             const userRole = rolesData.find(
  //               (role) => role.role_name.toLowerCase() === "user"
  //             );
  //             if (userRole) {
  //               setRoleId(userRole.role_id);
  //             } else if (rolesData.length > 0) {
  //               setRoleId(rolesData[0].role_id);
  //             }
  //           } else {
  //             setError("Roles data is not an array.");
  //           }
  //         }
  //       } catch (error) {
  //         setError(error.message || "Failed to fetch roles.");
  //       }
  //     };
  //     fetchUserRoles();
  //   }

  //   return ()=>setUserFetchList([])
  // }, [token, location.pathname,selectedFilter]);
  // const sortedData = useMemo(() => {
  //   // console.log("filteredData", filteredData);
  //   if (!sortConfig.key) return filteredData;

  //   return [...filteredData].sort((a, b) => {
  //     const aValue = a[sortConfig.key] || "";
  //     const bValue = b[sortConfig.key] || "";

  //     if (
  //       ["partnership", "balance", "exposureLimit"].includes(sortConfig.key)
  //     ) {
  //       const numA = parseFloat(aValue) || 0;
  //       const numB = parseFloat(bValue) || 0;
  //       return sortConfig.direction === "ascending" ? numA - numB : numB - numA;
  //     }

  //     if (sortConfig.key === "status") {
  //       return sortConfig.direction === "ascending"
  //         ? aValue.localeCompare(bValue)
  //         : bValue.localeCompare(aValue);
  //     }

  //     return sortConfig.direction === "ascending"
  //       ? aValue?.localeCompare(bValue)
  //       : bValue?.localeCompare(aValue);
  //   });
  // }, [filteredData, sortConfig]);

  const paginatedData = filteredData;
  const totalPages = Math.ceil(totalUsers / entriesToShow);

  const handleEntriesChange = (e) => {
    setEntriesToShow(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key && prev.direction === "ascending"
        ? { key, direction: "descending" }
        : { key, direction: "ascending" }
    );
  };

  const handleSubmitFunction = (newCreditRef, password) => {
    console.log("New Credit Ref:", newCreditRef, "Password:", password);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleListView = (user) => {
    setCreditReferenceTransactionList(user);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  // if (error) {
  //   console.error("Error fetching user:", error);
  //   return (
  //     <div className="text-red-500 font-custom font-bold">
  //       An error occurred: {error}
  //     </div>
  //   );
  // }
  const handleDeleteModalClose = () => {
    setUpdatePartnership(false);
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
    setDepositModal(false);
    setSettingsModal(false);
    setAccountStatus(false);
    setCreditReferenceTransactionList(false);
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      // console.log("Deleting user:", userToDelete.username);
    }
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleExposureEditClick = (user) => {
    setSelectedExposureUser(user);
    setIsExposureModalOpen(true);
  };

  const handleUpdatePartnership = (item) => {
    setUpdatePartnership(true);
    setSelectedUser(item);
  };

  const handleExposureModalClose = () => {
    setIsExposureModalOpen(false);
    setSelectedExposureUser(null);
  };

  const handleIconClick = (user) => {
    setDepositModal(true);
    setSelectedUser(user);
  };

  const handleOpenSettings = (user) => {
    setSettingsModal(true);
    setSelectedUser(user);
  };
  const statushandlechange = (user) => {
    setAccountStatus(true);
    setSelectedUser(user);
  };

  const handleUsernameList = async (item) => {
    try {
      const allowedRoles = [
        "master",
        "agent",
        "super-admin",
        "super",
        "white-level",
        "sub-admin",
      ];

      // if (allowedRoles.includes(item.role_name)) {
        const data = await fetchallUsers(item._id,currentPage,entriesToShow);
        console.log(data,'totalUserstotalUserstotalUserstotalUserstotalUsers')
        setUserFetchList(data?.data);
        if(data?.pagination?.totalUsers){
          setTotalUsers(data?.pagination?.totalUsers || 0)
        }else{
          setTotalUsers(downlineData?.length)
        }

        if (
          item.role_name == "agent" ||
          item.role_name == "user" ||
          item.role_name == "sub-admin" ||
          item.role_name == "master" ||
          item.role_name == "white-level" ||
          item.role_name == "super"
        ) {
          setDataList(data?.data)
          console.log(data,'donenondoenodnods')
          if(data?.data?.length > 0){
            setIsNested(true);
          }else{
            setIsNested(false)
          }
        }
      // } else if (item.role_name == "user") {
      //   return null;
      // }
    } catch (error) {
      console.error("Error fetching details:", error);
    }
  };

  // const handleUsernameList = async (item) => {
  //   try {
  //     const validRoles = [
  //       "master",
  //       "agent",
  //       "super-admin",
  //       "super",
  //       "white-level",
  //       "sub-admin",
  //     ];

  //     if (validRoles.includes(item.role_name)) {
  //       const data = await fetchallUsers(item._id);
  //       setUserFetchList(data);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching details:", error);
  //   }
  // };

  // const fetchUsers = async () => {
  //   if (!selectedFilter) return;
  //   try {
      // const fetchedUsers = await fetchUsersByStatus(selectedFilter, roleId);
  //     setUserList(fetchedUsers);
  //   } catch (error) {
  //     console.error("Error fetching users:", error);
  //   }
  // };

  const handleFilterChange = (e) => {
    setSelectedFilter(e.target.value);
  };

  useEffect(() => {
    // fetchUsers();
  }, [selectedFilter]);

  const handleDelete = async (item) => {
    try {
   const res =   await deleteData(`user/delete-user/${item._id}`);
   console.log(res,'resresresresresres123')
      toast.success("User deleted successfully.");

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const rolesArray = await fetchRoles(token);
      if (!Array.isArray(rolesArray) || rolesArray.length === 0) {
        throw new Error("No roles found. Please check your configuration.");
      }

      const rolesData = rolesArray.map((role) => ({
        role_name: role.role_name,
        role_id: role._id,
      }));

      let roleId = null;

      if (location.pathname.includes("/user-downline-list")) {
        const userRole = rolesData.find((role) => role.role_name === "user");
        roleId = userRole ? userRole.role_id : rolesData[0].role_id;
      } else if (location.pathname.includes("/master-downline-list")) {
        const masterRole = rolesData.find(
          (role) => role.role_name === "master"
        );
        roleId = masterRole ? masterRole.role_id : rolesData[0].role_id;
      } else {
        throw new Error("Invalid location path. Unable to determine roleId.");
      }
        let type = location.pathname?.includes('/master-downline-list') ? '' : 'user'
      const result = await fetchDownlineData(
        currentPage,
        entriesToShow,
        roleId,
        '',
        type
      );
      console.log(result,'resultresultresult')
      if (result && result.data) {
        setUserToDelete(item);
        setIsDeleteModalOpen(true);
        dispatch(setDownlineData(result.data));
      }

      dispatch(resetDeleteState());
      // onClose();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An error occurred. Please try again.";
      toast.error(errorMessage,{
        autoClose : 2000
      });
    } finally {
      setLoading(false);
    }
  };


  console.log(userData?.data?.role_name,'rorlorolorl')

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div><AnimatedLoader/></div>
        </div>
      ) : (
        <>
          {userFetchList?.length && location?.pathname?.includes('/master-downline-list')? (
            <>
              <div
                className="border rounded p-2 mb-3 w-full sm:w-max flex items-center text-nowrap cursor-pointer bg-green-50 border-green-500 text-green-600 font-custom font-medium"
                onClick={() =>{
                   setUserFetchList([])
                   setIsNested(false)
                  }}
              >
                <div className="bg-green-500 text-white px-2 py-1 mr-2 rounded font-custom font-medium text-xs sm:text-sm w-14">
                  Master
                </div>
                <div className="text-sm sm:text-base">
                  {userFetchList?.[0]?.username}
                </div>
              </div>
            </>
          ) : (
            ""
          )}
          <div className="md:p-4 p-3 border border-gray-300 rounded-md bg-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-4 sm:space-y-0">
              <div className="flex items-center flex-1 w-full">
                {/* Show Entries Dropdown */}
                <div className="rounded-md flex items-center w-full sm:w-auto">
                  <label className="mr-2 text-[13px] font-custom font-medium">
                    Show
                  </label>
                  <select
                    value={entriesToShow}
                    onChange={handleEntriesChange}
                    // className="border border-gray-300 rounded px-2 py-1 text-sm w-full sm:w-auto"
                    className="border rounded px-2 py-1 text-sm border-gray-400 sm:w-auto"
                  >
                    {[10, 25, 50, 100].map((number) => (
                      <option key={number} value={number}>
                        {number}
                      </option>
                    ))}
                  </select>
                  <label className="ml-2 text-[13px] font-custom font-medium">
                    entries
                  </label>
                </div>

                {/* Filter Dropdown */}
                <div className="flex-1 md:mr-2">
                  <div className="rounded-md w-full sm:w-28 ml-auto">
                    <select
                      value={selectedFilter}
                      onChange={handleFilterChange}
                      // className="border rounded py-1 px-2 text-sm bg-gray-200 text-black border-gray-400 sm:ml-10 "
                      className="border rounded py-1 px-2 text-sm bg-gray-200 text-black border-gray-400"
                    >
                      <option value="">All</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="locked">Locked</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full sm:w-auto">
                {/* Search Input */}
                <div className="flex w-full sm:flex-row sm:items-center sm:space-x-2">
                  <label className=" text-[13px] p-1">Search:</label>
                  {!accountStatus && (
                    <div className="rounded-md w-full sm:w-28">
                      <input
                        id="search"
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="border border-gray-300 rounded px-2 py-1 text-[13px] outline-none w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse border border-gray-300">
                <thead className="border border-gray-300">
                  <tr className="bg-gray-200">
                    {[
                      { key: "username", label: "Username" },
                      { key: "creditReference", label: "Credit Ref." },
                      ...(isMasterDownlineList
                        ? [{ key: "partnership", label: "Partnership" }]
                        : []),
                      { key: "totalOpeningBalance", label: "Balance" },
                      { key: "totalExposureBalance", label: "Exposure" },
                      ...(!isMasterDownlineList
                        ? [{ key: "exposureLimit", label: "Exposure Limit" }]
                        : []),
                      { key: "totalAvailableBalance", label: "Avail. Bal." },
                      { key: "refPL", label: "Ref. P/L" },
                      ...(!isMasterDownlineList
                        ? [{ key: "partnership", label: "Partnership" }]
                        : []),
                      { key: "status", label: "Status" },
                    ].map(({ key, label }) => (
                      <th
                        key={key}
                        className="border border-gray-300 text-left sm:px-3 px-2 py-2 text-[13px] text-nowrap text-black cursor-pointer"
                        onClick={() => handleSort(key)}
                      >
                        <div className="flex justify-between">
                          <div className="flex items-center ">{label}</div>
                          <div className="flex flex-col items-center ml-2">
                            <FaSortUp
                              className={`${sortConfig.key === key &&
                                  sortConfig.direction === "ascending"
                                  ? "text-black"
                                  : "text-gray-400"
                                }`}
                              style={{
                                marginBottom: "-6px",
                              }}
                            />
                            <FaSortDown
                              className={`${sortConfig.key === key &&
                                  sortConfig.direction === "descending"
                                  ? "text-black"
                                  : "text-gray-400"
                                }`}
                              style={{
                                marginTop: "-6px",
                              }}
                            />
                          </div>
                        </div>
                      </th>
                    ))}
                    <th className="border border-gray-300 text-left sm:px-3 px-2 py-2 text-[13px] font-custom font-bold text-black">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dataList?.length ? (
                    [...dataList]?.sort((a, b) => {
                      if (sortConfig?.key !== '') {
                        if(sortConfig?.direction == 'ascending'){
                          console.log('runnnnn2',a[sortConfig.key] - b[sortConfig.key])
                          if(sortConfig?.key == 'refPL'){
                            return (a?.totalOpeningBalance - a?.creditReference) - (b?.totalOpeningBalance - b?.creditReference)
                          }else if(sortConfig?.key == 'username'){
                            return a.name?.localeCompare(a.name)
                          }else{
                            return a[sortConfig.key] - b[sortConfig.key]
                          }
                        }else if(sortConfig?.direction == 'descending'){
                          console.log('runnnnn3', b[sortConfig.key] - a[sortConfig.key])
                          if(sortConfig?.key == 'refPL'){
                            return (b?.totalOpeningBalance - b?.creditReference) - (a?.totalOpeningBalance - a?.creditReference)
                          }else if(sortConfig?.key == 'username'){
                            return b?.name?.localeCompare(a?.name)
                          }else{
                        return  b[sortConfig.key] - a[sortConfig.key]
                          }
                        }}
                    })?.map((item) => (
                      <tr
                        key={item?._id}
                        className="border border-gray-300 bg-white"
                      >
                        <td className="sm:px-3 px-2 py-2 text-[13px] text-nowrap text-darkblack">
                          <div
                            onClick={() => handleUsernameList(item)}
                            className={`${item.role_name === "master"
                                ? "cursor-pointer"
                                : ""
                              }`}
                          >
                            <span
                              className={`bg-green-500 text-white px-[6px] py-[2px] text-[10.5px] mr-1 rounded font-custom font-semibold text-l ${item.role_name === "master"
                                  ? "cursor-pointer"
                                  : ""
                                }`}
                            >
                              {item.role_name?.toUpperCase()}
                            </span>
                            <span
                              className="text-balck font-custom font-semibold cursor-pointer"
                              style={{
                                fontFamily: "Tahoma, Helvetica, sans-serif",
                              }}
                            >
                              {item.username}
                            </span>
                          </div>
                        </td>
                        <td
                          className="border border-gray-300 text-darkblack sm:px-3 px-2 py-2 text-[13px] text-blue-700 font-semibold text-nowrap"
                        >
                          <span className="flex items-center">
                            {new Intl.NumberFormat("en-IN", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            }).format(item.creditReference)}
                     {item?.createdBy == userData?.data?._id  ?        
                                <span className="ml-2 inline-flex space-x-2">
                              <FaEdit
                                className="text-[#315195] cursor-pointer"
                                onClick={() => handleEditClick(item)}
                              />
                              <FaEye
                                className="text-[#315195] cursor-pointer"
                                onClick={() => handleListView(item)}
                              />
                            </span> : <></>}
                          </span>
                        </td>
                        {!isMasterDownlineList && (
                          <td
                            className="border border-gray-300 text-darkblack sm:px-3 px-2 py-2 text-[13px] text-blue-900 font-custom font-semibold"
                          >
                            {new Intl.NumberFormat("en-IN", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            }).format(item.totalOpeningBalance)}
                          </td>
                        )}
                        {isMasterDownlineList && (
                          <td
                            className="border border-gray-300 sm:px-3 px-2 py-2 text-[13px] text-darkblack font-custom font-semibold"
                          >
                            <span className="flex items-center">
                              {new Intl.NumberFormat("en-IN", {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                              }).format(item.partnership)}
                            {item?.createdBy == userData?.data?._id ?  
                             <span className="ml-2 inline-flex space-x-2">
                                <FaEdit
                                  className="text-[#315195] cursor-pointer"
                                  onClick={() => handleUpdatePartnership(item)}
                                />
                              </span> : <></>}
                            </span>
                          </td>
                        )}
                        {isMasterDownlineList && (
                          <td
                            className="border border-gray-300 sm:px-3 px-2 text-darkblack py-2 text-[13px] text-blue-900 font-custom font-semibold"
                          >
                            {new Intl.NumberFormat("en-IN", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            }).format(item.totalOpeningBalance)}
                          </td>
                        )}
                        <td
                          className="border border-gray-300 sm:px-3 px-2 py-2 text-[13px] text-red-700 font-custom font-semibold"
                        >
                          (
                          {new Intl.NumberFormat("en-IN", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          }).format(Math?.abs(item.totalExposureBalance))}
                          )
                        </td>
                        {!isMasterDownlineList && (
                          <td
                            className="border border-gray-300 sm:px-3 px-2 py-2 text-[13px] text-darkblack font-custom font-semibold"
                          >
                            <span className="flex items-center">
                              {new Intl.NumberFormat("en-IN", {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                              }).format(item.exposureLimit)}
                              <span className="ml-2 inline-flex space-x-2">
                                <FaEdit
                                  className="text-[#315195]  cursor-pointer"
                                  onClick={() => handleExposureEditClick(item)}
                                />
                              </span>
                            </span>
                          </td>
                        )}
                        <td
                          className="border border-gray-300 sm:px-3 px-2 py-2 text-darkblack text-[13px] font-custom font-semibold"
                        >
                          {new Intl.NumberFormat("en-IN", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          }).format(item.availableBalanceMainUsers || 0)}
                        </td>
                        <td
                          className={`border border-gray-300 sm:px-3 px-2 py-2 text-darkblack text-[13px] font-custom font-semibold ${item?.totalOpeningBalance - item?.creditReference <
                              0
                              ? "text-red-500"
                              : ""
                            }`}
                        >
                          ({item.profit_loss < 0
                            ? `(-${new Intl.NumberFormat("en-IN", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            }).format(Math.abs(item.profit_loss))})`
                            : new Intl.NumberFormat("en-IN", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            }).format(
                              item?.totalOpeningBalance -
                              item?.creditReference
                            )})
                        </td>
                        {!isMasterDownlineList && (
                          <td
                            className="border border-gray-300 sm:px-3 px-2 py-2 text-darkblack text-[13px] text-blue-900 font-custom font-semibold"
                          >
                            {location?.pathname?.includes('/user-downline-list') ? 100 : item?.partnership}
                          </td>
                        )}
                        <td
                          className="border border-gray-300 sm:px-3 px-2 py-2 font-custom font-bold text-l"
                        >
                          <span
                            className={`px-2 py-[2px] rounded-[3px] border text-[11px] ${item.status === "active"
                                ? "text-[#508d0e] border-[#bedca7] bg-[#e5f1dc]"
                                : item.status === "suspended"
                                  ? "text-red-600 border-red-600 bg-red-100"
                                  : item.status === "locked"
                                    ? "text-red-600 border-red-600 bg-red-100"
                                    : "text-gray-600 border-gray-600 bg-gray-100"
                              }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        {/* <td className="px-4 py-2 text-sm">
                          <div className="flex md:space-x-2.5 space-x-2">
                            <div
                              onClick={() => handleIconClick(item)}
                              title="Banking"
                              className="flex items-center justify-center w-8 h-8 border border-gray-400 rounded-md bg-gray-200 cursor-pointer hover:bg-gray-300 transition-all duration-200"
                            >
                              <AiFillDollarCircle className="text-darkgray" />
                            </div>
                            {!isMasterDownlineList && (
                              <div
                                onClick={() => handleArrowClick(item, item._id)}
                                className="flex items-center justify-center w-8 h-8 border border-gray-400 rounded-md bg-gray-200"
                              >
                                <RiArrowUpDownFill className="text-darkgray" />
                              </div>
                            )}
                            {!isMasterDownlineList && (
                              <div
                                onClick={() => handleHistoryClick(item)}
                                className="flex items-center justify-center w-8 h-8 border border-gray-400 rounded-md bg-gray-200"
                              >
                                <MdManageHistory className="text-darkgray" />
                              </div>
                            )}
                            <div
                              onClick={() => statushandlechange(item)}
                              title="Change status"
                              className="flex items-center justify-center w-8 h-8 border border-gray-400 rounded-md bg-gray-200"
                            >
                              <MdSettings className="text-darkgray" />
                            </div>

                            <div
                              onClick={() => {
                                handleProfileClick(item, item._id);
                                console.log("item", item._id);
                              }}
                              className="flex items-center justify-center w-8 h-8 border border-gray-400 rounded-md bg-gray-200 cursor-pointer"
                            >
                              <FaUserAlt className="text-darkgray" />
                            </div>

                            <div
                              onClick={() => handleOpenSettings(item)}
                              title="Sports Settings"
                              className="flex items-center justify-center w-8 h-8 border border-gray-400 rounded-md bg-gray-200 cursor-pointer"
                            >
                              <BsBuildingFillLock className="text-darkgray" />
                            </div>
                            <div
                              onClick={() => handleDeleteClick(item)}
                              title="Delete"
                              className="flex items-center justify-center w-8 h-8 border border-gray-400 rounded-md bg-gray-200 cursor-pointer"
                            >
                              <MdDelete
                                className="text-"
                                onClick={() => handleDelete(item)}
                              />
                            </div>
                          </div>
                        </td> */}
                        <td className="sm:px-3 px-2 py-2 text-sm">
                          <div className="flex md:space-x-2.5 space-x-2">
                            {isNested &&
                              (item.role_name == "agent" ||
                                item.role_name == "user" ||
                                item.role_name == "sub-admin" ||
                                item.role_name == "master" ||
                                item.role_name == "white-level" ||
                                item.role_name == "super") ? (
                              // Show only three icons for agent and user in nested condition
                              <>
                                <div
                                  onClick={() =>
                                    handleArrowClick(item, item._id)
                                  }
                                  className="flex items-center justify-center size-[26px] border border-gray-400 rounded-md bg-gray-200"
                                >
                                   <img src={pl} className="text-darkgray" />
                                </div>

                                <div
                                  onClick={() => handleHistoryClick(item)}
                                  className="flex items-center justify-center size-[26px] border border-gray-400 rounded-md bg-gray-200"
                                >
                                  <img src={betHistory} className="text-darkgray" />
                                </div>
                             {userData?.data?.role_name == 'super-admin' ? 
                                <div
                                  onClick={() => statushandlechange(item)}
                                  title="Change status"
                                  className="flex items-center justify-center size-[26px] border border-gray-400 rounded-md bg-gray-200"
                                >
                                  <img src={setting} className="text-darkgray" />
                                </div>
                                :''}
                                <div
                                  onClick={() => {
                                    handleProfileClick(item, item._id);
                                    console.log("item", item._id);
                                  }}
                                  className="flex items-center justify-center size-[26px] border border-gray-400 rounded-md bg-gray-200 cursor-pointer"
                                >
                                  <img src={profile} className="text-darkgray" />
                                </div>
                              </>
                            ) : (
                              <>
                                <div
                                  onClick={() => handleIconClick(item)}
                                  title="Banking"
                                  className="flex items-center justify-center size-[26px] border border-gray-400 rounded-md bg-gray-200 cursor-pointer hover:bg-gray-300 transition-all duration-200"
                                >
                                  <img src={banking} className="text-darkgray" />
                                </div>

                                {!isMasterDownlineList && (
                                  <div
                                    onClick={() =>
                                      handleArrowClick(item, item._id)
                                    }
                                    className="flex items-center justify-center size-[26px] border border-gray-400 rounded-md bg-gray-200"
                                  >
                                    <img src={pl} className="text-darkgray" />
                                  </div>
                                )}

                                {!isMasterDownlineList && (
                                  <div
                                    onClick={() => handleHistoryClick(item)}
                                    className="flex items-center justify-center size-[26px] border border-gray-400 rounded-md bg-gray-200"
                                  >
                                    <img src={betHistory} className="text-darkgray" />
                                  </div>
                                )}

                                <div
                                  onClick={() => statushandlechange(item)}
                                  title="Change status"
                                  className="flex items-center justify-center size-[26px] border border-gray-400 rounded-md bg-gray-200"
                                >
                                  <img src={setting} className="text-darkgray" />
                                </div>

                                <div
                                  onClick={() => {
                                    handleProfileClick(item, item._id);
                                    console.log("item", item._id);
                                  }}
                                  className="flex items-center justify-center size-[26px] border border-gray-400 rounded-md bg-gray-200 cursor-pointer"
                                >
                                  <img src={profile} className="text-darkgray" />
                                </div>

                                <div
                                  onClick={() => handleOpenSettings(item)}
                                  title="Sports Settings"
                                  className="flex items-center justify-center size-[26px] border border-gray-400 rounded-md bg-gray-200 cursor-pointer"
                                >
                                  <img src={sportSetting} className="text-darkgray" />
                                </div>

                                <div
                                  onClick={() => handleDelete(item)}
                                  title="Delete"
                                  className="flex items-center justify-center size-[26px] border border-gray-400 rounded-md bg-gray-200 cursor-pointer"
                                >
                                  <img src={deleteIcon} className="text-darkgray" />
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="text-center p-6">
                        No Data Available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col p-2 sm:flex-row justify-between items-center mt-4 space-y-2 sm:space-y-0">
              {/* Showing entries text */}
              <div className=" text-[12px] text-gray-600">
                Showing{" "}
                {totalUsers === 0 ? 0 : (currentPage - 1) * entriesToShow + 1}{" "}
                to {Math.min(currentPage * entriesToShow, totalUsers)} of{" "}
                {totalUsers} entries
              </div>

              {/* Pagination Buttons */}
              <div className="flex sm:ml-auto">
                {/* First Button */}
                <button
                  onClick={() => handlePageChange("first")}
                  className={`sm:sm:px-3 px-2 py-1 text-[12px] rounded ${currentPage === 1
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-100"
                    }`}
                  disabled={currentPage === 1}
                >
                  First
                </button>

                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange("prev")}
                  className={`sm:sm:px-3 px-2 py-1 text-[12px] rounded ${currentPage === 1
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-100"
                    }`}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    if (
                      page === 1 ||
                      page === currentPage ||
                      page === totalPages ||
                      (page >= currentPage - 2 && page <= currentPage + 2)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`sm:sm:px-3 px-2 sm:py-1 py-0.5 text-[12px] border border-white rounded ${currentPage === page
                              ? "bg-gray-200 border-gray-700"
                              : "hover:bg-gray-100"
                            }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      (page === currentPage - 3 && currentPage > 4) ||
                      (page === currentPage + 3 && currentPage < totalPages - 3)
                    ) {
                      return (
                        <span key={page} className="sm:sm:px-3 px-2 py-1 text-[12px]">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                )}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange("next")}
                  className={`sm:sm:px-3 px-2 py-1 text-[12px] rounded ${currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-100"
                    }`}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>

                {/* Last Button */}
                <button
                  onClick={() => handlePageChange("last")}
                  className={`sm:sm:px-3 px-2 py-1 text-[12px] rounded ${currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-100"
                    }`}
                  disabled={currentPage === totalPages}
                >
                  Last
                </button>
              </div>
            </div>

            {isModalOpen && selectedUser && (
              <>
                <CreditEditReferenceModal
                  isOpen={isModalOpen}
                  onCancel={handleModalClose}
                  username={selectedUser.username}
                  currentCreditRef={selectedUser.creditReference}
                  onSubmit={handleSubmitFunction}
                  user={selectedUser}
                  setRoleId={setRoleId}
                  fetchData={fetchData}
                  userId={selectedUser?._id}
                  currentPage={currentPage}
                  entriesToShow={entriesToShow}
                />
              </>
            )}
            {selectedUser && updatePartnership && (
              <>
                <UpdatePartnershipModal
                  isOpen={updatePartnership}
                  onCancel={handleDeleteModalClose}
                  username={selectedUser.username}
                  currentPartnership={selectedUser.partnership}
                  onSubmit={handleSubmitFunction}
                  user={selectedUser}
                  setRoleId={setRoleId}
                  fetchData={fetchData}
                  userId={selectedUser?._id}
                  currentPage={currentPage}
                  entriesToShow={entriesToShow}
                />
              </>
            )}
            {/* Log userId */}
            {creditReferenceTransactionList && (
              <>
                <CreditReferenceTransactionModel
                  username={creditReferenceTransactionList.username}
                  isOpen={creditReferenceTransactionList}
                  onClose={handleDeleteModalClose}
                  fetchData={fetchData}
                  // onConfirm={handleDeleteConfirm}
                  userId={creditReferenceTransactionList?._id}
                  currentPage={currentPage}
                  setRoleId={setRoleId}
                  entriesToShow={entriesToShow}
                />
              </>
            )}
            {selectedUser && depositModal && (
              <DepositModal
                isOpen={depositModal}
                onClose={handleDeleteModalClose}
                userId={selectedUser?._id}
                currentPage={currentPage}
                entriesToShow={entriesToShow}
                roleId={roleId}
                setList={setList}
                list={list}
                fetchData={fetchData}
                setRoleId={setRoleId}
                user={selectedUser}
              />
            )}
            {selectedUser && (
              <>
                <SportsSettingsModal
                  isOpen={settingsModal}
                  onClose={handleDeleteModalClose}
                  // onConfirm={handleDeleteConfirm}
                  userId={selectedUser?._id}
                  fetchData={fetchData}
                  currentPage={currentPage}
                  setRoleId={setRoleId}
                  entriesToShow={entriesToShow}
                />
              </>
            )}
            {selectedUser && accountStatus && (
              <>
                <AccountStatus
                  isOpen={accountStatus}
                  onClose={handleDeleteModalClose}
                  // onConfirm={handleDeleteConfirm}
                  userId={selectedUser?._id}
                  fetchData={fetchData}
                  currentPage={currentPage}
                  entriesToShow={entriesToShow}
                  setRoleId={setRoleId}
                  user={selectedUser}
                />
              </>
            )}
            {isExposureModalOpen && selectedExposureUser && (
              <>
                <EditExposureLimitModal
                  username={selectedExposureUser.username}
                  currentExposureLimit={selectedExposureUser.exposureLimit}
                  onSubmit={(newExposureLimit, password) => {
                    console.log(
                      `Updated exposure limit for ${selectedExposureUser.username}: ${newExposureLimit} (Password: ${password})`
                    );
                    handleExposureModalClose();
                  }}
                  onCancel={handleExposureModalClose}
                  // onSubmit={handleSubmitFunction}
                  user={selectedExposureUser}
                  userId={selectedExposureUser?._id}
                  fetchData={fetchData}
                  currentPage={currentPage}
                  setRoleId={setRoleId}
                  entriesToShow={entriesToShow}
                />
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default DownlineList;
