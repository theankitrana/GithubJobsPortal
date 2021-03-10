import React, { useState } from 'react';
import useFetchJobs from './useFetchJobs'
import { Container } from 'react-bootstrap'
import Job from './Job'
import JobsPagination from './JobsPagination';
import SearchForm from './SearchForm';
import Loader from "react-loader-spinner";


function App() {
  const [params, setParams] = useState({})
  const [page, setPage] = useState(1)
  const { jobs, loading, error, hasNextPage } = useFetchJobs(params, page)

// works for searching functionality
  function handleParamChange(e) {
    const param = e.target.name
    const value = e.target.value
    setPage(1)
    setParams(prevParams => {
      // set the previous params we have along with what we've entered now
      return { ...prevParams, [param]: value }
    })
  }
  
  return (
    <Container className="my-4">
       <h1 className="mb-4" onClick={() => window.location.reload()} style = {{cursor: "pointer"}}>GitHub Jobs Portal</h1>
      <SearchForm params={params} onParamChange={handleParamChange} />
      <JobsPagination page={page} setPage={setPage} hasNextPage={hasNextPage} />
      {loading && <Loader type="ThreeDots" color="#00BFFF" height={80} width={80} />}
      {error && <h1>Error. Try Refreshing.</h1>}
      {jobs.map(job => {
        return <Job key={job.id} job={job} />
      })}
      <JobsPagination page={page} setPage={setPage} hasNextPage={hasNextPage} />
    </Container>
  )
}

export default App;
