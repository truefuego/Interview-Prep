import React, { useEffect, useState } from 'react'
import styles from './Dashboard.module.css'
import axios from 'axios'
import useFeedbackStore from '../../stores/giveFeedback'
import useAuthStore from '../../stores/authStore'
import { useNavigate } from 'react-router-dom'
import slugify from 'slugify'

const Dashboard = () => {
  const navigate = useNavigate()
  const { auth } = useAuthStore()
  const { createInterview, interviewId } = useFeedbackStore()  
  const [selectedValue,setSelectedValue] = useState("1")
  const handleChange = (e) => {
    setSelectedValue(e.target.value);
  };
  //
  useEffect(() => {
    if(!auth?.token) {
      navigate('/')
    }
  },[auth?.token])
  //


  const startInterviewHandler = async(e) => {
    // Create new interview room in db)
    const res = await axios.post(`${process.env.REACT_APP_API}/api/v1/rooms/create-room`,{user: auth.user.username,interviewType: selectedValue})
    console.log(auth.user.username,selectedValue)
    if(res.data.success) {
      createInterview(res.data.interviewRoom._id)
      navigate(`/room/${slugify(res.data.interviewRoom.interviewerName)}`)
    }
    else{
      alert(res.data.message)
    }
  }

  const feedbackHandler = () => {
    navigate('/feedback-form')
  }

  const joinInterviewHandler = async() => {
    const res = await axios.get(`${process.env.REACT_APP_API}/api/v1/rooms/get-room`);
    if(!(await res).data.success) {
      alert(res.data.message)
      return
    }
    if(res.data.interview === null) {
      alert("No Meetings at this moment")
      return
    }
    const interview = res.data.rooms[0]
    if(interview === undefined) {
      alert("No Meetings at this moment")
      return 
    }
    const abc = await axios.post(`${process.env.REACT_APP_API}/api/v1/rooms/join-room`,{interviewRoomId: interview._id,intervieweeName: auth.user.username,joinRoom: false})
    if(!abc.data.success) {
      alert(abc.data.message)
      return
    }
    navigate(`/room/${slugify(interview.interviewerName)}`)
  }

  return (
    <>
    <div className={styles.dashboard}>
      <header className={styles.navbar}>
        <div className={styles.navbarChild} />
        <div className={styles.navbarItem} 
        onClick={() => navigate('/user')}/>
        <b className={styles.home}>Home</b>
        <b className={styles.leaderboard} onClick={() => navigate('/ratings')}>Leaderboard</b>
        <b className={styles.explore}>Explore</b>
        <b className={styles.more}>More ...</b>
      </header>
      <img
        className={styles.dashboardImageIcon}
        alt=""
        src="/dashboardimage.svg" 
      />
      {!interviewId ? (<button className={styles.startFeedbackButton} onClick={startInterviewHandler}>
        {/* <div className={styles.startFeedbackButtonChild} /> */}
        <b className={styles.startAMeeting}>Take an Interview</b>
      </button>) : (<button className={styles.startFeedbackButton} onClick={feedbackHandler}>
        {/* <div className={styles.startFeedbackButtonChild} /> */}
        <b className={styles.startAMeeting}>Give Feedback</b>
      </button>)}
      <button className={styles.joinInterviewButton} onClick={joinInterviewHandler}>
        {/* <div className={styles.joinInterviewButtonChild} /> */}
        <b className={styles.startAMeeting1}>Give an Interview</b>
        
      </button>

      <b className={styles.premiumMeetings}>Premium Meetings</b>
      <div className={styles.nowFreeFor}>Now Free for everyone</div>
    </div>      
    <select value={selectedValue} className= {styles.optionsButtons} onChange={handleChange}>
      <option value="1">Front End</option>
      <option value="2">Back End</option>
      <option value="3">Full Stack</option>
      <option value="4">Data structures & Algorithms</option>
    </select>
    </>
  )
}

export default Dashboard