import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectBetListData,
  selectBetListError,
  selectBetListLoading,
} from "../../Store/Slice/betListSlice";
import { selectBetListFilter } from "../../Store/Slice/betListFilterSlice";
import { FaSortDown, FaSortUp } from "react-icons/fa";
import ManageBetFilter from "./ManageBetFilter";
import { liabilityBook } from "../../Store/Slice/liabilitySlice";
import {
  getCreateNewMatchAPIAuth,
  getMatchList,
} from "../../Services/Newmatchapi";
import RemarkModal from "../marketBetModal/RemarkModal";
import { DeleteBet, RevertBet } from "../../Services/manageBetapi";
import Pagination from "../pagination/Pagination";
import moment from "moment";
import RevertModal from "../marketBetModal/RevertModal";
import { toast } from "react-toastify";

function ManageBets({ Userid }) {
  const dispatch = useDispatch();
  const data = useSelector(selectBetListData);
  const loading = useSelector(selectBetListLoading);
  const error = useSelector(selectBetListError);
  const [password,setPassword]=useState('');
  const filters = useSelector(selectBetListFilter);
  const dataLiability = useSelector((state) => state.liability.data);
  const total = useSelector((state) => state.liability);
  const pages = useSelector((state) => state.liability?.pages);
  const [selectFilterData, setSelectFilterData] = useState({
    match: "",
    sport: "4",
    odds: "",
    session: "",
    status: "REVERT",
    date1: "",
    date2: "",
    fromTime: "",
    toTime: "",
  });
  const {
    sessions,
    loading: loader,
    error: err,
  } = useSelector((state) => state);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [betlistData, setBetlistData] = useState([]);
  const [remarkModal, setRemarkModal] = useState(false);
  const [remarkModal2,setRemarkModal2] = useState(false);
  const [remark, setRemark] = useState("");
  const [totalBets, setTotalBets] = useState(0);
  const [checkbox, setCheckbox] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectBet, setSelectBet] = useState({});
  const [selectedUsername, setSelectedUsername] = useState(null);

  const [isDataFetched, setIsDataFetched] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "username",
    direction: "ascending",
  });

  const handleBetlistUpdate = (newData) => {
    setBetlistData(newData);
  };

  const handleDeleteBet = async (item) => {
    setRemarkModal(true);
    if (remark !== "") {
      try {
        const res = await DeleteBet("user/delete-bets", {
          betIds: checkbox?.length == 0 ? selectBet?._id : checkbox,
          matchId: selectFilterData?.match
            ? selectFilterData?.match
            : selectBet?.matchId,
          type: selectFilterData?.odds
            ? selectFilterData?.odds
            : selectBet?.matchType,
          remark: remark,
          betDeletePassword : password
        });
        if (res?.data?.success) {
          setSelectBet({});
          setRemark("");
          setRemarkModal(false);
          setPassword('')
          toast.success(res?.data?.message)
        }
      } catch (error) {
        setSelectBet({});
        setRemarkModal(false);
      }
    }
  };

  const handleRevertBet = async (item) => {
    try {
      const res = await RevertBet("user/revert-delete-bets", {
        betIds: checkbox?.length == 0 ? selectBet?._id : checkbox,
        matchId: selectFilterData?.match
          ? selectFilterData?.match
          : selectBet?.matchId,
        type: selectFilterData?.odds
          ? selectFilterData?.odds
          : selectBet?.matchType,
          betDeletePassword : password
      });
      if (res?.data?.success) {
        toast.success(res?.data?.message)
        setSelectBet({});
          setRemark("");
          setRemarkModal2(false);
          setPassword('')
        dispatch(
          liabilityBook({
            page: currentPage,
            limit: 10,
            sport:
              selectFilterData?.sport == "4"
                ? "Cricket"
                : selectFilterData?.sport == "2"
                ? "Tennis"
                : "Soccer",
            type: selectFilterData?.odds,
            matchId: selectFilterData?.match,
            sessionId: selectFilterData?.session,
            status: selectFilterData?.status,
            fromTime: selectFilterData?.fromTime,
            toTime: selectFilterData?.toTime,
            betDeletePassword : password
          })
        );
      }
    } catch (error) {
      toast.error(error)
      
    }
  };

  useEffect(() => {
    setBetlistData(data);
    setCurrentPage(1);
  }, [data, filters]);

  const handlePageChange = (direction) => {
    let newPage = currentPage;
    if (direction === "next" && currentPage < totalPages) newPage++;
    else if (direction === "prev" && currentPage > 1) newPage--;
    else if (direction === "first") newPage = 1;
    else if (direction === "last") newPage = totalPages;

    setCurrentPage(newPage);
  };
  const paginatedData = betlistData.slice(
    (currentPage - 1) * entriesToShow,
    currentPage * entriesToShow
  );

  useEffect(() => {
    if (total.total) {
      setTotalBets(total.total);
      setTotalPages(pages);
      // setBetlistData(data.data || []);
    }
  }, [total, pages]);

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...betlistData].sort((a, b) => {
    const aValue = a[sortConfig.key] || "";
    const bValue = b[sortConfig.key] || "";
    if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
    return 0;
  });

  const handleCheckbox = (e) => {
    if (e.target.checked && e.target.value == "all") {
      const id = dataLiability?.map((item) => {
        return item?._id;
      });
      setCheckbox(id);
      return;
    } else if (!e.target.checked && e.target.value == "all") {
      setCheckbox([]);
      return;
    }
    if (e.target.checked) {
      setCheckbox((pre) => setCheckbox([...pre, e.target.value]));
    } else {
      setCheckbox(checkbox.filter((item) => item !== e.target.value));
    }
  };


  return (
    <>
      <ManageBetFilter
        setTotalBets={(total) => setTotalBets(total)}
        setTotalPages={(total) => setTotalPages(total)}
        setBetlistData={handleBetlistUpdate}
        entriesToShow={entriesToShow}
        handleDeleteBet={handleDeleteBet}
        handleRevertBet={handleRevertBet}
        checkbox={checkbox}
        remarkModal={remarkModal}
        reverModal={remarkModal2}
        setRevertModal={setRemarkModal2}
        currentPage={currentPage}
        selectFilterData={selectFilterData}
        setSelectFilterData={setSelectFilterData}
        setIsDataFetched={(isFetched) => console.log(isFetched)}
        setCurrentPage={setCurrentPage}
        userID={Userid}
      />
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="relative w-48 h-48">
            <div className="absolute w-8 h-8 bg-gradient-green rounded-full animate-crossing1"></div>
            <div className="absolute w-8 h-8 bg-gradient-blue rounded-full animate-crossing2"></div>
            <div className="absolute bottom-[-40px] w-full text-center text-xl font-semibold text-black">
              Loading...
            </div>
          </div>
        </div>
      ) : (
        ""
      )}

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto mt-4">
          <table className="w-full table-auto border-collapse border border-gray-400 p-2">
            <thead className="border border-gray-400 bg-gray-200 text-black text-center">
              <tr className="text-center">
                {[
                  "",
                  "sportName",
                  "event",
                  "username",
                  "market type",
                  "date",
                  "odds",
                  // "status",
                  "selection",
                  "type",
                  "P&L",
                  "Actions",
                ].map((key) => (
                  <th
                    key={key}
                    className="border border-gray-300 text-center sm:px-3 px-2 py-2 text-[13px] text-nowrap text-black cursor-pointer"
                    onClick={() => handleSort(key)}
                  >
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center">
                        <span className="w-full text-center">
                          {key === "sportName" ? (
                            "Sport Name"
                          ) : key === "event" ? (
                            "Event"
                          ) : key === "market type" ? (
                            "Market Type"
                          ) : key === "username" ? (
                            "Username" ) : key === "date" ? (
                            "Date"
                          ) : key === "odds" ? (
                            "Odds"
                          ) : // : key === "status"
                          // ? "Bet Status"
                          key === "p&l" ? (
                            "P&L"
                          ) : key === "selection" ? (
                            "Selection"
                          ) : key === "type" ? (
                            "Type"
                          ) : key === "" ? (
                            <input
                              type="checkbox"
                              value="all"
                              onChange={handleCheckbox}
                            />
                          ) : (
                            key
                          )}
                        </span>
                        {key === "" ? (
                          <></>
                        ) : (
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
                        )}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="text-center bg-white">
              {dataLiability?.length > 0 ? (
                dataLiability.map((item, index) => (
                  <tr key={index}>
                    <td className="sm:px-3 px-2 py-2 text-[13px] text-nowrap border border-gray-300 text-darkblack">
                      <label>
                      <input
                        type="checkbox"
                        checked={checkbox?.includes(item?._id) ? true : false}
                        value={item?._id}
                        onChange={handleCheckbox}
                      />
                      </label>
                    </td>

                    <td
                      onClick={() => {
                      setSelectedUserId(item.createdBy);
                        setSelectedUsername(item.username);
                        setIsModalOpen(true);
                      }}
                      className="sm:px-3 px-2 py-2 text-[13px] text-nowrap border border-gray-300 text-blue font-bold"
                    >
                      {item.sport}
                    </td>

                    <td className="sm:px-3 px-2 py-2 text-[13px] text-nowrap border border-gray-300 text-darkblack">
                      {item.event}
                    </td>
                    <td className="sm:px-3 px-2 py-2 text-[13px] text-nowrap border border-gray-300 text-darkblack">
                      {item.username}
                    </td>
                    <td className="sm:px-3 px-2 py-2 text-[13px] text-nowrap border border-gray-300 text-darkblack">
                      {item.type == 'toss' ? 'TOSS' : item?.type == 'odds' ? 'MATCH ODDS' : item?.type == 'bookmakers' ? 'BOOKMAKERS' : item?.type == 'fancy' ? 'FANCY' : ''}
                    </td>
                    <td className="sm:px-3 px-2 py-2 text-[13px] text-nowrap border border-gray-300 text-darkblack">
                      {moment(item.createdAt).format("MMMM Do YYYY, h:mm:ss a")}
                    </td>
                    <td className="sm:px-3 px-2 py-2 text-[13px] text-nowrap border border-gray-300 text-darkblack">
                      {item.odds}
                    </td>
                    {/* <td className="border border-gray-400 px-4 py-3">
                      {item?.betstatus?.toUpperCase()}
                    </td> */}
                      <td className={`sm:px-3 px-2 py-2 text-[13px] text-nowrap border border-gray-300 text-darkblack`}>
                      {item.selection}
                    </td>
                    <td className={`sm:px-3 px-2 py-2 text-[13px] text-nowrap border border-gray-300 ${(item.betType == 'no' || item.betType == 'lay') ? 'text-red-500 font-bold' : 'text-blue font-bold'}`}>
                      {(item.betType == 'no' || item.betType == 'lay') ? 'Lay' : 'Back'}
                    </td>
                    <td className="sm:px-3 px-2 py-2 text-[13px] text-nowrap border border-gray-300 text-darkblack">
                    <span className={item.potentialWin < 0 ? "text-red-600" : "text-green-600 font-bold"}>{item.potentialWin.toFixed(2)}</span> <span className="text-red-700 font-bold">(-{item.amount.toFixed(2) || 0})</span>
                    </td>
                    <td className="sm:px-3 px-2 py-2 text-[13px] text-nowrap border border-gray-300 text-darkblack">
                      <div className="sm:flex gap-y-2 gap-x-3 justify-center">
                        {item?.isDeleted ? (
                          <button
                            className="bg-lightblue text-white px-3 p-1 text-[12px] rounded"
                            onClick={() =>{
                               setRemarkModal2(true)
                               setSelectBet(item);
                              }}
                          >
                            Revert
                          </button>
                        ) : (
                          <button
                            className="bg-red-500 text-white px-3 p-1 text-[12px] rounded"
                            onClick={() => {
                              setRemarkModal(true);
                              setSelectBet(item);
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="sm:px-3 px-2 py-2 text-[13px] text-nowrap border border-gray-300 text-darkblack text-center">
                    No data !
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col p-2 sm:flex-row justify-between items-center mt-3 space-y-2 sm:space-y-0">
        {/* Showing entries text */}
        <div className="text-[13px] text-gray-600">
          Showing {totalBets === 0 ? 0 : (currentPage - 1) * entriesToShow + 1}{" "}
          to {Math.min(currentPage * entriesToShow, totalBets)} of {totalBets}{" "}
          entries
        </div>

        {/* Pagination Buttons */}
        {total.total < 1 ? (
          ""
        ) : (
          <div className="flex space-x-2">
            {/* First Button */}
            <button
              onClick={() => setCurrentPage(1)}
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
              onClick={() => setCurrentPage(currentPage - 1)}
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
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
                    className={`px-3 py-1 text-sm border border-gray-300 rounded ${
                      currentPage === page ? "bg-gray-200" : "hover:bg-gray-100"
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
                  <span key={page} className="px-3 py-1 text-sm">
                    ...
                  </span>
                );
              }
              return null;
            })}

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
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
              onClick={() => setCurrentPage(totalPages)}
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
      <RemarkModal
        showUser={remarkModal}
        remark={remark}
        handleDeleteBet={handleDeleteBet}
        setRemark={setRemark}
        setShowUser={setRemarkModal}
        password={password}
        setPassword={setPassword}
      />

      <RevertModal
        showUser={remarkModal2}
        setShowUser={setRemarkModal2}
        remark={remark}
        handleDeleteBet={handleRevertBet}
        password={password}
        setPassword={setPassword}
      />
    </>
  );
}

export default ManageBets;
