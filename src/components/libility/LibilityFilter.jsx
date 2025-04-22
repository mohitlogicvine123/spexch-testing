import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import {
  setType,
  setSport,
  setFromDate,
  setToDate,
  selectBetListFilter,
} from "../../Store/Slice/betListFilterSlice";
import { getBetlistData } from '../../Services/Betlistapi';
import { getCreateNewMatchAPIAuth, getMatchList } from '../../Services/Newmatchapi';
import { liabilityBook } from '../../Store/Slice/liabilitySlice';
import { matchListBook } from '../../Store/Slice/matchlistGameIdSlice';
import { fetchSessions } from '../../Store/Slice/SessionSlice';
import { pendingLiabilityBook } from '../../Store/Slice/pendingLiability';
import { pendingMarketBook } from '../../Store/Slice/pendingMarket';

function LibilityFilter({
  setBetlistData,
  setTotalBets,
  remarkModal,
  setTotalPages,
  checkbox,
  handleDeleteBet,
  handleRevertBet,
  entriesToShow,
  selectFilterData,
  setSelectFilterData,
  currentPage,
  setIsDataFetched,
  setCurrentPage,
  userID, // userID is passed as a prop
}) {


  const dispatch = useDispatch();
  const { type, sport, fromDate, toDate } = useSelector(selectBetListFilter);

  const [sportsOptions, setSportsOptions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
 
  const [selectedSession,setSelectedSession] = useState('')
  const [loading,setLoading] = useState(false)
  const sessions = useSelector((state)=>state.sessions)
  const matchList = useSelector((state)=>state.matchlist.data)
  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

  // Set default values when component mounts
  useEffect(() => {
    dispatch(setType("unsettled"));
    dispatch(setSport("Cricket"));
    dispatch(setFromDate(today));
    dispatch(setToDate(today));
  }, [dispatch, today]);

   const handleSportChange = (e,name) => {
    if(name == 'sport'){
      const selectedSport = e.target.value;
      dispatch(setSport(selectedSport));
    }
    setSelectFilterData((pre)=>({...pre,[name] : e.target.value}))
    };

        
  useEffect(() => {
    dispatch(matchListBook({gameId: selectFilterData?.sport}))
  }, [
    selectFilterData?.sport
  ]);

  useEffect(()=>{
     dispatch(fetchSessions(selectFilterData?.match));
  },[selectFilterData?.match])

  
    
  useEffect(() => {
    if(remarkModal == false){
      dispatch(pendingMarketBook({
        page : currentPage,
        limit : 10,
        sport : selectFilterData?.sport  ,
        type : selectFilterData?.odds,
        matchId : selectFilterData?.match,
        sessionId : selectFilterData?.session,
        status : selectFilterData?.status
       }))
    }
  }, [
    selectFilterData?.sport,
    selectFilterData?.match,
    selectFilterData?.odds,
    selectFilterData?.status,
    selectFilterData?.date1,
    selectFilterData?.date2,
    selectFilterData?.session,
    currentPage,
    remarkModal
  ]);


  useEffect(() => {
    // Fetch sports options
    const fetchSports = async () => {
      try {
        const response = await getCreateNewMatchAPIAuth("games/getgames");
        console.log({response})
        if (response.status === 200) {
          setSportsOptions(response.data.data || []); // Adjust based on API response
        }
      } catch (error) {
        console.error("Error fetching sports:", error);
      }
    };
    fetchSports();
  }, []);



  console.log(sessions,'selectFilterData')
  return (
    <>
       <div className="grid lg:grid-cols-6 md:grid-cols-5 sm:grid-cols-2 grid-cols-1 items-end gap-3 mb-4 p-4 bg-gray-100 border border-gray-300 rounded-md">
          {/* Choose Type */}
        <div className="">
          <label className="text-[13px] font-medium text-black mb-1">
            Select Sport
          </label>
          <select className="border text-[13px] outline-none w-full p-2 rounded" 
            value={selectFilterData.sport} 
            onChange={(e)=>handleSportChange(e,'sport')}
          >
            <option value="">Select Sport</option>
            {loading ? (
              <option value="">Loading...</option>
            ) : (
              sportsOptions?.length > 0 ? (
                sportsOptions.map((sportOption) => (
                  <option key={sportOption.id} value={sportOption.gameId}>
                    {sportOption.name}
                  </option>
                ))
              ) : (
                <option value="">No Sports Available</option>
              )
            )}
          </select>
        </div>

        <div className="">
          <label className="text-[13px] font-medium text-black mb-1">
            Select Match
          </label>
          <select className="border text-[13px] w-full p-2 rounded outline-none" 
            value={selectFilterData.match} 
            onChange={(e)=>handleSportChange(e,'match')}
            >
              <option value="">Select Match</option>
              {loading ? (
                <option value="">Loading...</option>
              ) : (
                matchList?.length > 0 ? (
                  matchList?.filter((itm)=>itm.allBetCount > 0)?.map((match) => (
                    <option key={match.id} value={match._id}>
                       {match.match} {match?.inPlay ? "(In Play)" : ""}
                    </option>
                  ))
                ) : (
                  <option value="">No Sports Available</option>
                )
              )}
            </select>
        </div>

        {/* Choose Sport */}
        <div className="">
          <label className="text-[13px] font-medium text-black mb-1">
            Select Odds
          </label>
          <select className="border text-[13px] outline-none p-2 w-full rounded" 
          value={selectFilterData.odds} 
          onChange={(e)=>handleSportChange(e,'odds')}
          >
            <option value="">Select Odds</option>
            {loading ? (
              <option value="">Loading...</option>
            ) : (
              [{name : 'Match Odds',_id : 'odds'}, {name : 'Bookmakers',_id:'bookmakers'},{name : 'Fancy',_id :'fancy'},{name : 'Toss',_id :'toss'}].map((sport) => (
                <option key={sport._id} value={sport._id}>
                  {sport.name}
                </option>
              ))
            )}
          </select>
        </div>

     {sessions?.length > 0 ? 
      <div className="">
        <label className="text-[13px] font-medium text-black mb-1">
            Select Sessions
          </label>
        <select
          value={selectFilterData.session}
          onChange={(e)=>handleSportChange(e,'session')}
          id="session"
          className="border w-full text-[13px] outline-none p-2 rounded"
        >
          <option value="">Select Session</option>
          {filteredSessions.filter((session) => !session.result).map((session, index) => (
            <option key={index} value={session.marketId}>
              {session.marketName}
            </option>
          ))}
        </select>
      </div> : <></>}
    
         
      <div className=" justify-start sm:justify-center w-full sm:w-auto sm:mt-0 mt-2">
        <button
          onClick={()=>{
            dispatch(liabilityBook({
              page : currentPage,
              limit : 10,
              sport : selectFilterData?.sport == '4' ? 'Cricket' : selectFilterData?.sport == '2' ? 'Tennis' : 'Soccer' ,
              type : selectFilterData?.odds,
              matchId : selectFilterData?.match,
              sessionId : selectFilterData?.session,
              status : selectFilterData?.status
              }))
          }}
          className="px-4 py-2 bg-gradient-seablue text-white rounded-md text-sm font-semibold w-auto sm:px-8"
        >
          Get Bets
        </button>
      </div>

          {/* <div className=' sm:col-span-4 w-full items-end col-span-12'>
            <div className='flex gap-x-4 justify-end items-center'>
            <div className="col-span-6 sm:col-span-2 mb-1 sm:mb-6">
        <label className="text-[12px] sm:text-sm font-medium text-black mb-1">
              Bet Status
            </label>
            <select className="border text-[12px] font-bold sm:text-sm p-2 w-full rounded" 
            value={selectFilterData.status} 
            onChange={(e)=>handleSportChange(e,'status')}
            >
              {loading ? (
                <option value="">Loading...</option>
              ) : (
                [{name : 'Active Bets',_id : 'REVERT'}, {name : 'Delete Bets',_id:'DELETED'}].map((sport) => (
                  <option key={sport._id} value={sport._id} className='font-bold'>
                    {sport.name}
                  </option>
                ))
              )}
            </select>
          </div>
            
            </div>
          </div> */}
        </div>
    </>
  )
}

export default LibilityFilter
