import React, { createContext, useContext, useReducer, useCallback } from 'react';
import api from '../api/axios';

const CandidatesContext = createContext();

const initialState = {
  candidates: [],
  loading: false,
  error: null,
  stats: { total: 0, assessed: 0, competent: 0, nonCompetent: 0, byDept: [] },
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_CANDIDATES':
      return { ...state, candidates: action.payload, loading: false };
    case 'ADD_CANDIDATE':
      return { ...state, candidates: [action.payload, ...state.candidates] };
    case 'ADD_CANDIDATES_BULK':
      return { ...state, candidates: [...action.payload, ...state.candidates] };
    case 'UPDATE_CANDIDATE':
      return {
        ...state,
        candidates: state.candidates.map((c) =>
          c._id === action.payload._id ? action.payload : c
        ),
      };
    case 'DELETE_CANDIDATE':
      return {
        ...state,
        candidates: state.candidates.filter((c) => c._id !== action.payload),
      };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    default:
      return state;
  }
}

export function CandidatesProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchCandidates = useCallback(async (params = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await api.get('/candidates', { params });
      dispatch({ type: 'SET_CANDIDATES', payload: data });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message || 'Fetch failed' });
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/candidates/stats');
      dispatch({ type: 'SET_STATS', payload: data });
    } catch {}
  }, []);

  const createCandidate = useCallback(async (candidateData) => {
    const { data } = await api.post('/candidates', candidateData);
    dispatch({ type: 'ADD_CANDIDATE', payload: data });
    return data;
  }, []);

  const bulkCreate = useCallback(async (rows) => {
    const { data } = await api.post('/candidates/bulk', rows);
    dispatch({ type: 'ADD_CANDIDATES_BULK', payload: data.data });
    return data;
  }, []);

  const updateCandidate = useCallback(async (id, updates) => {
    const { data } = await api.put(`/candidates/${id}`, updates);
    dispatch({ type: 'UPDATE_CANDIDATE', payload: data });
    return data;
  }, []);

  const updateStatus = useCallback(async (id, status, failType = '') => {
    const { data } = await api.patch(`/candidates/${id}/status`, { status, failType });
    dispatch({ type: 'UPDATE_CANDIDATE', payload: data });
    return data;
  }, []);

  const bulkUpdateStatus = useCallback(async (ids, status, failType = '') => {
    const { data } = await api.patch('/candidates/bulk/status', { ids, status, failType });
    data.data.forEach((c) => dispatch({ type: 'UPDATE_CANDIDATE', payload: c }));
    return data;
  }, []);

  const deleteCandidate = useCallback(async (id) => {
    await api.delete(`/candidates/${id}`);
    dispatch({ type: 'DELETE_CANDIDATE', payload: id });
  }, []);

  // Derived stats computed from local state (always in sync)
  const computedStats = {
    total: state.candidates.length,
    assessed: state.candidates.filter((c) =>
      ['Assessed', 'Competent', 'Non-Competent'].includes(c.status)
    ).length,
    competent: state.candidates.filter((c) => c.status === 'Competent').length,
    nonCompetent: state.candidates.filter((c) => c.status === 'Non-Competent').length,
  };

  const deptMatrix = [...new Set(state.candidates.map((c) => c.dept))].map((dept) => {
    const dCandidates = state.candidates.filter((c) => c.dept === dept);
    return {
      dept,
      registered: dCandidates.length,
      assessed: dCandidates.filter((c) =>
        ['Assessed', 'Competent', 'Non-Competent'].includes(c.status)
      ).length,
      competent: dCandidates.filter((c) => c.status === 'Competent').length,
      nonCompetent: dCandidates.filter((c) => c.status === 'Non-Competent').length,
    };
  });

  return (
    <CandidatesContext.Provider
      value={{
        ...state,
        computedStats,
        deptMatrix,
        fetchCandidates,
        fetchStats,
        createCandidate,
        bulkCreate,
        updateCandidate,
        updateStatus,
        bulkUpdateStatus,
        deleteCandidate,
      }}
    >
      {children}
    </CandidatesContext.Provider>
  );
}

export const useCandidates = () => useContext(CandidatesContext);
