import axios from "axios";
import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../Constant/Api";

const RestoreUser = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [restoreUser, setRestoreUser] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // const userData = JSON.parse(localStorage.getItem("userData"));

  // console.log("userDatauserData");
  // const userID = userData?.data._id;

  // console.log("userID", userID);

  const filteredData = restoreUser.filter((item) =>
    item.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // const paginatedData = filteredData.slice(
  //   (currentPage - 1) * entriesToShow,
  //   currentPage * entriesToShow
  // );

  const handlePageChange = (direction) => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    } else if (direction === "first") {
      setCurrentPage(1);
    } else if (direction === "last") {
      setCurrentPage(totalPages);
    }
  };

  const formatDateTime = (date) => {
    const formattedDate = new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const formattedTime = new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return `${formattedDate} ${formattedTime}`;
  };

  const handleEntriesChange = (e) => {
    setEntriesToShow(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleRestoreUser = async (userId) => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.put(
        `${BASE_URL}/user/restore-user`,
        {  page: currentPage,
          limit: entriesToShow,
          userId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.data?.success) {
        setRestoreUser((prevUsers) =>
          prevUsers.filter((user) => user._id !== userId)
        );

        fetchRestoreUser();
      } else {
        console.error("Failed to restore user");
      }
    } catch (error) {
      console.error("Error restoring user:", error);
    }
  };

  // Make fetchRestoreUser a reusable function
  const fetchRestoreUser = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No token found for authorization.");
        return;
      }

      const response = await axios.get(`${BASE_URL}/user/get-deleted-user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: currentPage,
          limit: entriesToShow,
        },
      });
      const data = response.data;
      console.log("data", data);
      if (data.success) {
        setRestoreUser(data?.data || []);
        setTotalCount(data?.pagination.totalRecords);
        setTotalRecords(data?.pagination.totalRecords);
        setTotalPages(Math.ceil(data?.pagination.totalRecords / entriesToShow));
      } else {
        console.error("Failed to fetch password history.");
      }
    } catch (error) {
      console.error("An error occurred while fetching deleted user:", error);
    } finally {
      setLoading(false);
    }
  };

  // Call fetchRestoreUser in useEffect
  useEffect(() => {
    fetchRestoreUser();
  }, [currentPage, entriesToShow]);

  return (
    <div className="md:mx-0 mx-2">
      <div className="border border-gray-300 rounded-[5px] overflow-hidden bg-white">
        <h1 className="bg-gradient-seablue text-white font-custom font-semibold text-[14px] p-2">
          Restore User
        </h1>
        <div className="md:p-4 p-3">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            {/* Entries Dropdown */}
            {/* <div className="flex items-center space-x-2 ml-10"> */}
            <div className="flex items-center space-x-2 sm:ml-0 ml-10">
              <label className="text-[13px]">Show</label>
              <select
                value={entriesToShow}
                onChange={handleEntriesChange}
                className="border rounded px-1 outline-none py-1 text-[13px]"
              >
                {[10, 25, 50, 100].map((number) => (
                  <option key={number} value={number}>
                    {number}
                  </option>
                ))}
              </select>
              <label className="text-[13px]">entries</label>
            </div>

            {/* Search Input */}
            <div className="flex items-center space-x-2">
              <label className="text-[13px]">Search:</label>
              <input
                type="text"
                className="border border-gray-300 rounded-[5px] p-1.5 outline-none text-[13px] w-full sm:w-auto"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-300 sm:px-3 px-2 py-2 text-[13px] text-nowrap text-black cursor-pointer text-center">
                    Username
                  </th>
                  <th className="border border-gray-300 sm:px-3 px-2 py-2 text-[13px] text-nowrap text-black cursor-pointer text-center">
                    Name
                  </th>
                  <th className="border border-gray-300 sm:px-3 px-2 py-2 text-[13px] text-nowrap text-black cursor-pointer text-center">
                    Date & Time
                  </th>
                  <th className="border border-gray-300 sm:px-3 px-2 py-2 text-[13px] text-nowrap text-black cursor-pointer text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map(
                    (item, index) => (
                      console.log("item", item),
                      (
                        <tr
                          key={index}
                          className="even:bg-gray-100 odd:bg-white border border-gray-300 sm:px-3 px-2 py-2 text-[13px] text-nowrap text-darkblack"
                        >
                          <td className="border border-gray-300 sm:px-3 px-2 py-2 text-[13px] text-nowrap text-darkblack">
                            {item.username}
                          </td>
                          <td className="border border-gray-300 sm:px-3 px-2 py-2 text-[13px] text-nowrap text-darkblack">
                            {item.name}
                          </td>
                          <td className="border border-gray-300 sm:px-3 px-2 py-2 text-[13px] text-nowrap text-darkblack">
                            {formatDateTime(item.deletedAt)}
                          </td>
                          <td className="border border-gray-300 sm:px-3 px-2 py-2 text-[13px] text-nowrap text-darkblack">
                            <button
                              className="text-md bg-gradient-seablue text-white font-bold p-1 rounded"
                              onClick={() => handleRestoreUser(item._id)}
                            >
                              Restore
                            </button>
                          </td>
                        </tr>
                      )
                    )
                  )
                ) : (
                  <tr>
                    <td colSpan="4" className="border border-gray-300 sm:px-3 px-2 py-2 text-[13px] text-nowrap text-darkblack">
                      No user found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4 flex-col sm:flex-row">
            {/* Showing entries text */}
            <div className="text-[12px] text-gray-600 mb-2 sm:mb-0">
              Showing{" "}
              {totalRecords === 0 ? 0 : (currentPage - 1) * entriesToShow + 1}{" "}
              to {Math.min(currentPage * entriesToShow, totalRecords)} of{" "}
              {totalRecords} entries
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
        </div>
      </div>
    </div>
  );
};

export default RestoreUser;
