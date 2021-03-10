import { useReducer, useEffect } from 'react'
import axios from 'axios'

// Various Cases For action
const ACTIONS = {
  MAKE_REQUEST: 'make-request',
  GET_DATA: 'get-data',
  ERROR: 'error',
  UPDATE_HAS_NEXT_PAGE: 'update-has-next-page'
}


// To handle cors error we can use :
// https://stark-mesa-12909.herokuapp.com this link will set proxy for all we need to do is append the website where we need access in it
//example for getting access to : https://jobs.github.com/positions.json we do -> https://cors-anywhere.herokuapp.com/https://jobs.github.com/positions.json
const BASE_URL = 'https://stark-mesa-12909.herokuapp.com/https://jobs.github.com/positions.json'

// function that handles dispatch action from useReducer
function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.MAKE_REQUEST:
      return { loading: true, jobs: [] }
    case ACTIONS.GET_DATA:
      return { ...state, loading: false, jobs: action.payload.jobs }
    case ACTIONS.ERROR:
      return { ...state, loading: false, error: action.payload.error, jobs: [] }
    case ACTIONS.UPDATE_HAS_NEXT_PAGE:
      return { ...state, hasNextPage: action.payload.hasNextPage }
    default:
      return state
  }
}

export default function useFetchJobs(params, page) {
  const [state, dispatch] = useReducer(reducer, { jobs: [], loading: true })

  useEffect(() => {
    // to avoid making a lot of axios calls again and again on params change we use canceltoken
    const cancelToken1 = axios.CancelToken.source()
    dispatch({ type: ACTIONS.MAKE_REQUEST })
    axios.get(BASE_URL, {
      cancelToken: cancelToken1.token,
      params: { markdown: true, page: page, ...params }
    }).then(res => {
       // Getting Data and Setting Jobs from Response Received
      dispatch({ type: ACTIONS.GET_DATA, payload: { jobs: res.data } }) 
    }).catch(e => {
       // handling the CancellToken as that is a purposely generated error
      if (axios.isCancel(e)) return
      dispatch({ type: ACTIONS.ERROR, payload: { error: e } }) 
    })

    // Making another request to check if next page exists or not
    const cancelToken2 = axios.CancelToken.source()
    axios.get(BASE_URL, {
      cancelToken: cancelToken2.token,
      params: { markdown: true, page: page + 1, ...params }
    }).then(res => {
      dispatch({ type: ACTIONS.UPDATE_HAS_NEXT_PAGE, payload: { hasNextPage: res.data.length !== 0 } }) 
    }).catch(e => {
      if (axios.isCancel(e)) return
      dispatch({ type: ACTIONS.ERROR, payload: { error: e } }) 
    })

    // cleaner functions
    return () => {
      cancelToken1.cancel()
      cancelToken2.cancel()
    }
  }, [params, page])
  
  return state
}