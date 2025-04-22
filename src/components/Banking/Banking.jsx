import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  fetchDownlineData,
  performTransaction,
} from "../../Services/Downlinelistapi";
import {
  setLoading,
  setError,
  setDownlineData,
} from "../../Store/Slice/downlineSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import {
  selectDownlineData,
  selectDownlineLoading,
  selectDownlineError,
} from "../../Store/Slice/downlineSlice";
import { fetchRoles } from "../../Utils/LoginApi";
import { FaSortUp, FaSortDown, FaEdit } from "react-icons/fa";
import CreditEditReferenceModal from "../Modal/CreditEditReferanceModal";
import AnimatedLoader from "../MarketAnalysis/components/Animated";
import { fetchUserDataFailure, fetchUserDataStart, fetchUserDataSuccess } from "../../Store/Slice/userInfoSlice";
import { getUserData } from "../../Services/UserInfoApi";

const Banking = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [roleId, setRoleId] = useState("");
  const [roles, setRoles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const downlineData = useSelector(selectDownlineData);
  const loading = useSelector(selectDownlineLoading);
  const error = useSelector(selectDownlineError);
  const [editedData, setEditedData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
   const { userData } = useSelector((state) => state.user);
  const [chipSummary,setChipSummary] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const { startFetchData } = useSelector((state) => state.downline);
  const [password, setPassword] = useState("");
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [selectedButtonRow, setSelectedButtonRow] = useState(null);
  const [selectedButtonStatus, setSelectedButtonStatus] = useState(null);

  const [isSubmitClicked, setIsSubmitClicked] = useState(false);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const columns = [
    { key: "username", label: "UID" },
    { key: "totalOpeningBalance", label: "Balance" },
    { key: "totalOpeningBalance", label: "Available D/W" },
    { key: "totalExposureBalance", label: "Exposure" },
    { key: "creditReference", label: "Credit Reference" },
    { key: "referance", label: "Reference P/L" },
    { key: "depositwithdraw", label: "Deposit/Withdraw" },
    { key: "remark", label: "Remark" },
  ];

  const filteredData = downlineData.filter((item) =>
    item.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClearAll = () => {
    setEditedData([]);
    setPassword("");
    setSelectedRowIndex(null);
    setSearchTerm("");

    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleRowClick = (index) => {
    setSelectedRowIndex(index);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
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

  const fetchData = async () => {
    let type = location.pathname?.includes('/master-banking') ? '' : 'user'
    try {
      dispatch(setLoading(true));
      const result = await fetchDownlineData(
        currentPage,
        entriesToShow,
        roleId,
        '',
        type
      );

      console.log("Fetched downline data:", result.data);
      if (result && result.data) {
        dispatch(setDownlineData(result.data));
        setTotalUsers(result.pagination?.totalUsers || 0);
      }
    } catch (err) {
      console.error("Error fetching data:", err.message);
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleInputChange = (e, key, index) => {
    const { value } = e.target;
    setEditedData((prevState) => {
      const updatedData = [...prevState];
      updatedData[index] = {
        ...updatedData[index],
        [key]: value,
      };
      return updatedData;
    });
  };

  const handleButtonClick = (status, index) => {
    setEditedData((prevState) => {
      const updatedData = [...prevState];
      console.log(updatedData,'updatedData')

      if (selectedButtonRow !== null && selectedButtonRow !== index) {
        updatedData[selectedButtonRow] = {
          ...updatedData[selectedButtonRow],
          depositwithdrawStatus: "",
          highlightFull: false,
          depositwithdraw: "",
        };
      }

      if (!updatedData[index]) {
        updatedData[index] = {
          depositwithdrawStatus: "",
          highlightFull: false,
        };
      }

      if (
        updatedData[index].depositwithdrawStatus &&
        updatedData[index].depositwithdrawStatus !== status
      ) {
        updatedData[index].depositwithdrawStatus = "";
      }

      updatedData[index] = {
        ...updatedData[index],
        depositwithdrawStatus:
          updatedData[index].depositwithdrawStatus === status ? "" : status,
        highlightFull: status === "W" ? true : false,
      };

      if (status === "Full") {
        updatedData[index] = {
          ...updatedData[index],
          depositwithdrawStatus: "W",
          depositwithdraw: filteredData[index]?.totalAvailableBalance || "",
          highlightFull: true,
        };
      } else {
        updatedData[index] = {
          ...updatedData[index],
          depositwithdrawStatus: status,
          highlightFull:
            status === "W" ? true : updatedData[index]?.highlightFull,
          depositwithdraw: "",
        };
      }

      return updatedData;
    });

    setSelectedButtonRow(index);
    setSelectedButtonStatus(status);
  };

  const handleSubmitPaymentFunction = (data) => {
    if (!password) {
      toast.error("Please enter the password.", {
        autoClose: 5000,
      });
      return;
    }

    if (!data.userId) {
      toast.error("Invalid data. Ensure all fields are filled correctly.", {
        autoClose: 5000,
      });
      return;
    }

    if (!data.depositwithdraw || !data.depositwithdrawStatus) {
      toast.error("Amount is Mandatory", {
        autoClose: 5000,
      });
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Token not found. Please log in again.", {
        autoClose: 5000,
      });
      return;
    }

    const user = downlineData.find((item) => item._id === data.userId);
    if (
      data.depositwithdrawStatus === "W" &&
      user.totalBalance < Number(data.depositwithdraw)
    ) {
      toast.error(
        "Insufficient balance. Withdrawal amount exceeds total balance.",
        {
          autoClose: 5000,
        }
      );
      return;
    }

    performTransaction(
      data.depositwithdrawStatus,
      {
        userId: data.userId,
        amount: Number(data.depositwithdraw),
        password: data.password,
        description: data.remark,
      },
      token
    )
      .then((res) => {
        console.log(res.message, "ppp112221");
        toast.success(res?.message, {
          autoClose: 5000,
        });
        setPassword("");
        refreshData()
         fetchData()
        setEditedData((prevState) => {
          const updatedData = [...prevState];
          updatedData[selectedRowIndex] = {
            ...updatedData[selectedRowIndex],
            depositwithdraw: "",
            remark: "",
            depositwithdrawStatus: "",

            highlightFull: false,
          };
          return updatedData;
        });

        const updatedDownlineData = downlineData.map((item) =>
          item._id === data.userId
            ? {
                ...item,
                totalBalance:
                  data.depositwithdrawStatus === "D"
                    ? item.totalBalance + Number(data.depositwithdraw)
                    : item.totalBalance - Number(data.depositwithdraw),
                depositwithdraw: "",
              }
            : item
        );

        dispatch(setDownlineData(updatedDownlineData));
      })
      .catch((error) => {
        toast.error(
          error || `Error processing transaction for ${data.userId}.`,
          {
            autoClose: 5000,
          }
        );
      });
  };

  const handleSubmitPaymentForRow = () => {
    if (selectedRowIndex === null) {
      toast.error("No row selected for payment.");
      return;
    }
    setIsSubmitClicked(true);
    setTimeout(() => setIsSubmitClicked(false), 300);

    const item = filteredData[selectedRowIndex];
    const currentData = {
      userId: item._id,
      depositwithdraw:
        editedData[selectedRowIndex]?.depositwithdraw || item.depositwithdraw,
      depositwithdrawStatus:
        editedData[selectedRowIndex]?.depositwithdrawStatus,
      remark: editedData[selectedRowIndex]?.remark || item.remark || "",
      password,
    };

    console.log("Submit Payment Data:", currentData);
    handleSubmitPaymentFunction(currentData);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleSubmitFunction = (newCreditRef, password) => {
    console.log("New Credit Ref:", newCreditRef, "Password:", password);
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig((prev) =>
      prev.key === key && prev.direction === "ascending"
        ? { key, direction: "descending" }
        : { key, direction: "ascending" }
    );
  };

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortConfig.key] || "";
    const bValue = b[sortConfig.key] || "";
    if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
    return 0;
  });

  const handleEntriesChange = (e) => {
    setEntriesToShow(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  

  // useEffect(() => {
  //   fetchData();
  // }, [
  //   dispatch,
  //   currentPage,
  //   entriesToShow,
  //   roleId,
  //   startFetchData,
  //   location.pathname,
  // ]);

  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("Token not found. Please log in again.");
          navigate("/");
          return;
        }

        const rolesArray = await fetchRoles(token);

        if (!Array.isArray(rolesArray)) {
          setError("Roles data is not an array.");
          return;
        }

        const rolesData = rolesArray.map((role) => ({
          role_name: role.role_name,
          role_id: role._id,
        }));

        setRoles(rolesData);

        if (location.pathname.includes("/master-banking")) {
          const masterAgentRoles = rolesData.filter(
            (role) =>
              role.role_name.toLowerCase() !== userData?.data?.role_name && role.role_name.toLowerCase() !== 'user'

          );
          // if (masterAgentRoles.length > 0) {
          //   const fetchPromises = masterAgentRoles.map((role) =>
          //     fetchDownlineData(1, 10000, role.role_id)
          //   );
          //   const results = await Promise.all(fetchPromises);

          //   const combinedData = results.flatMap((result) => result.data || []);
          //   const totalUsers = combinedData.length;
          //   setTotalUsers(totalUsers);

          //   const startIndex = (currentPage - 1) * entriesToShow;
          //   const endIndex = startIndex + entriesToShow;
          //   const paginatedData = combinedData.slice(startIndex, endIndex);

          //   dispatch(setDownlineData(paginatedData));
          // } else if (rolesData.length > 0) {
            setRoleId(masterAgentRoles[0].role_id);
          // }
        } else if (location.pathname.includes("/user-banking")) {
          const userRole = rolesData.find((role) => role.role_name === "user");
          if (userRole) {
            setRoleId(userRole.role_id);
          }
        }
      } catch (error) {
        setError(error.message || "Failed to fetch roles.");
      }
    };

    fetchUserRoles();
  }, [location.pathname]);

  useEffect(() => {
    // if (roleId) {
    let type = location?.pathname?.includes('master-banking') ? '' : 'user'
      const fetchDownlineDataByRole = async () => {
        try {
          dispatch(setLoading(true));
          const data = await fetchDownlineData(
            currentPage,
            entriesToShow,
            roleId,
            '',
            type
          );
          console.log(data,'Fetched downline data:')
          dispatch(setDownlineData(data?.data));
          setTotalUsers(data?.pagination?.totalUsers)
        } catch (error) {
          console.error("Error fetching downline data:", error);
          dispatch(setError(error.message));
        } finally {
          dispatch(setLoading(false));
        }
      };

      fetchDownlineDataByRole();
    // }
  }, [  currentPage, entriesToShow, location.pathname]);

  const totalPages = Math.ceil(totalUsers / entriesToShow);

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

  const getStatusClasses = (status) => {
    if (status === "active")
      return "text-green-600 border-green-600 bg-green-100";
    if (status === "suspended" || status === "locked")
      return "text-red-600 border-red-600 bg-red-100";
    return "text-gray-600 border-gray-600 bg-gray-100";
  };


  console.log(userData,'resresresresresresresresresres')
  return (
    <>
    <div className="md:mx-0 mx-2">
      <div className="flex justify-end items-center md:my-3 my-2">
        <span className="font-bold mx-3 text-sm">Chips Summary </span>
        <div
          className={`relative inline-flex items-center rounded-[4px] h-7 w-14 p-[2px] border border-whiteGray cursor-pointer transition-colors ${
            chipSummary
              ? "bg-gradient-seablue"
              : "bg-white"
          }`}
          onClick={() =>setChipSummary(!chipSummary)}
        >
          <span
            className={`absolute right-2 text-sm font-bold ${
              chipSummary
                ? "text-transparent"
                : "text-whiteGray"
            }`}
          >
            ✗
          </span>

          <span
            className={`absolute left-2 text-sm font-bold ${
              chipSummary
                ? "text-white"
                : "text-transparent"
            }`}
          >
            ✓
          </span>

          <span
            className={`inline-block size-[21px] border rounded-[2px] border-whiteGray bg-white transform transition-transform ${
              chipSummary
                ? "translate-x-7"
                : "translate-x-[1.5px]"
            }`}
          ></span>
        </div>
      </div>
      <div className="md:p-4 p-3 border border-gray-300 rounded-md bg-white">
        {loading ? (
          <div className="flex justify-center items-center h-64">
          <AnimatedLoader/>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap justify-between items-center sm:flex-row flex-col sm:gap-4 gap-2 md:mb-4 mb-3">
              <div className="flex items-center">
                <label className="mr-1 text-[12px] font-medium">Show</label>
                <select
                  value={entriesToShow}
                  onChange={handleEntriesChange}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  {[10, 25, 50, 100].map((number) => (
                    <option key={number} value={number}>
                      {number}
                    </option>
                  ))}
                </select>
                <label className="ml-1 text-[12px] font-medium">entries</label>
              </div>
              <div className="p-2 rounded-md">
                <label className="p-1 text-[13px]">Search:</label>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="border border-gray-300 rounded px-2 py-1 outline-none text-[13px]"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full  table-auto border-collapse border border-gray-300">
                <thead className="border border-gray-300">
                  <tr className="bg-gray-200">
                    {columns.map(({ key, label }) => (
                      <th
                        key={key}
                        className="border border-gray-300 sm:px-3 px-2 py-2 text-[13px] text-black cursor-pointer text-center"
                        onClick={() => handleSort(key)}
                      >
                        <div className="flex justify-between items-center">
                          {label}
                          <div className="flex flex-col items-center ml-2">
                            <FaSortUp
                              className={`${
                                sortConfig.key === key &&
                                sortConfig.direction === "ascending"
                                  ? "text-black"
                                  : "text-gray-400"
                              }`}
                              style={{
                                marginBottom: "-6px",
                              }}
                            />
                            <FaSortDown
                              className={`${
                                sortConfig.key === key &&
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
                  </tr>
                </thead>
                <tbody>
                  {sortedData?.sort((a, b) => {
                      if (sortConfig?.key !== '') {
                        if(sortConfig?.direction == 'ascending'){
                          console.log('runnnnn2',a[sortConfig.key] , b[sortConfig.key],a)
                          if(sortConfig?.key == 'referance'){
                            return (a?.totalOpeningBalance - a?.creditReference) - (b?.totalOpeningBalance - b?.creditReference)
                          }else if(sortConfig?.key == 'username'){
                            return a.name?.localeCompare(a.name)
                          }else{
                            return a[sortConfig.key] - b[sortConfig.key]
                          }
                        }else if(sortConfig?.direction == 'descending'){
                          console.log('runnnnn3', b[sortConfig.key] , a[sortConfig.key])
                          if(sortConfig?.key == 'referance'){
                            return (b?.totalOpeningBalance - b?.creditReference) - (a?.totalOpeningBalance - a?.creditReference)
                          }else if(sortConfig?.key == 'username'){
                            return b?.name?.localeCompare(a?.name)
                          }else{
                        return  b[sortConfig.key] - a[sortConfig.key]
                          }
                        }}
                    }).map((item, index) => (
                    <tr
                      key={item._id}
                      className="border border-gray-400 bg-white hover:bg-gray-100"
                      onClick={() => handleRowClick(index)}
                    >
                      <td className="sm:px-3 px-2 py-2 text-[13px] text-nowrap border border-gray-300 text-darkblack">
                        <span className="text-black font-semibold">
                          {item.username}
                        </span>
                      </td>
                      <td className="sm:px-3 px-2 py-2 text-[13px] text-nowrap border border-gray-300 text-darkblack font-semibold">
                        {new Intl.NumberFormat("en-IN").format(
                          item.totalOpeningBalance
                        )}
                      </td>
                      <td className="sm:px-3 px-2 py-2 text-[13px] text-nowrap border border-gray-300 text-darkblack font-semibold">
                        {new Intl.NumberFormat("en-IN").format(
                          item.totalAvailableBalance
                        )}
                      </td>
                      <td className="sm:px-3 px-2 py-2 text-[13px] text-nowrap border border-gray-300 text-red-500 font-semibold">
                        {new Intl.NumberFormat("en-IN").format(
                          item.totalExposureBalance
                        )}
                      </td>
                      <td className="sm:px-3 px-2 py-2 text-[13px] text-nowrap border border-gray-300 text-NavyBlue font-semibold">
                        {new Intl.NumberFormat("en-IN").format(
                          item.creditReference
                        )}
                        <FaEdit
                          className="text-blue cursor-pointer ml-2"
                          onClick={() => handleEditClick(item)}
                        />
                      </td>
                      <td
                        className={`sm:px-3 px-2 py-2 text-[13px] text-nowrap border border-gray-300 text-red-500 font-semibold ${
                          item?.totalOpeningBalance - item?.creditReference <= 0
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        {new Intl.NumberFormat("en-IN").format(
                          item?.totalOpeningBalance - item?.creditReference
                        )}
                      </td>
                      <td className="sm:px-3 px-2 py-2 text-[13px] text-nowrap border border-gray-300">
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => handleButtonClick("D", index)}
                            className={`px-3 py-1 text-sm text-white font-semibold rounded-md ${
                              editedData[index]?.depositwithdrawStatus === "D"
                                ? "bg-green-600 text-white"
                                : "bg-gray-400 text-white"
                            } border border-black`}
                          >
                            D
                          </button>

                          <button
                            onClick={() => handleButtonClick("W", index)}
                            className={`px-3 py-1 text-sm text-white font-semibold rounded-md ${
                              editedData[index]?.depositwithdrawStatus === "W" ||
                              editedData[index]?.highlightFull
                                ? "bg-red-600 text-white"
                                : "bg-gray-400 text-white"
                            } border border-black`}
                          >
                            W
                          </button>

                          <input
                            type="text"
                            value={
                              editedData[index]?.depositwithdraw ||
                              item.depositwithdraw ||
                              ""
                            }
                            onChange={(e) =>
                              handleInputChange(e, "depositwithdraw", index)
                            }
                            className="border border-gray-300 px-2 w-[130px] outline-none text-[15px] text-gray-600 py-1.5 rounded text-sm"
                          />

                          <button
                            onClick={() => handleButtonClick("Full", index)}
                            className={`px-2.5 py-1.5 text-sm font-semibold rounded-md ${
                              editedData[index]?.highlightFull
                                ? "bg-gradient-blue text-white"
                                : "bg-gray-500 text-white"
                            }  `}
                            disabled={!editedData[index]?.highlightFull}
                          >
                            Full
                          </button>
                        </div>
                      </td>

                      <td className="sm:px-3 px-2 py-2 text-[13px] text-nowrap border border-gray-300">
                        <input
                          type="text"
                          value={editedData[index]?.remark || ""}
                          onChange={(e) => handleInputChange(e, "remark", index)}
                          placeholder="Remark"
                          className="border border-gray-300 rounded-[3px] outline-none px-2 py-1.5 text-sm"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-4 flex-col sm:flex-row">
              {/* Showing entries text */}
              <div className="text-[12px] text-gray-600 mb-2 sm:mb-0">
                Showing{" "}
                {totalUsers === 0 ? 0 : (currentPage - 1) * entriesToShow + 1} to{" "}
                {Math.min(currentPage * entriesToShow, totalUsers)} of{" "}
                {totalUsers} entries
              </div>

              {/* Pagination Buttons */}
              {totalPages > 1 && (
                <div className="flex space-x-2">
                  {/* First Button */}
                  <button
                    onClick={() => handlePageChange("first")}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 text-sm rounded ${
                      currentPage === 1
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    First
                  </button>

                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange("prev")}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 text-sm rounded ${
                      currentPage === 1
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 text-sm border border-gray-300 rounded ${
                              currentPage === page
                                ? "bg-gray-200"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span key={page} className="px-3 py-1 text-sm">
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
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 text-sm rounded ${
                      currentPage === totalPages
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    Next
                  </button>

                  {/* Last Button */}
                  <button
                    onClick={() => handlePageChange("last")}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 text-sm rounded ${
                      currentPage === totalPages
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    Last
                  </button>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-4 grid-cols-1 gap-3 left-0 bg-white bottom-0 sm:relative flex-col sm:flex-row items-center mt-4 w-full">
              <div className="md:col-span-2">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleClearAll}
                    className="px-2 py-2 bg-lightred text-white font-bold text-sm rounded-[5px] w-full "
                  >
                    Clear All
                  </button>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password.."
                    className="border border-gray-300 outline-none rounded-md px-2 py-2 text-gray-600 text-sm w-full sm:w-auto"
                  />
                </div>
              </div>
              <button
                onClick={() => handleSubmitPaymentForRow()}
                className={`px-3 py-2 ${
                  isSubmitClicked ? "bg-gradient-green" : "bg-gradient-seablue"
                } text-white text-sm lg:text-md rounded-md w-full font-semibold`}
              >
                Submit Payment
              </button>
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
                  fetchData={fetchData}
                  userId={selectedUser?._id}
                  currentPage={currentPage}
                  entriesToShow={entriesToShow}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
    </>
  );
};

export default Banking;
