const express = require('express');
const router = express.Router();
const {
  getCandidates,
  getCandidate,
  createCandidate,
  bulkCreateCandidates,
  updateCandidate,
  updateStatus,
  bulkUpdateStatus,
  deleteCandidate,
  getDashboardStats,
} = require('../controllers/candidateController');
const { protect } = require('../middleware/authMiddleware');

// Static routes MUST come before parameterized /:id routes
router.get('/stats', protect, getDashboardStats);
router.get('/', protect, getCandidates);
router.post('/bulk', protect, bulkCreateCandidates);       // before POST /
router.post('/', protect, createCandidate);
router.patch('/bulk/status', protect, bulkUpdateStatus);   // before PATCH /:id/status
router.patch('/:id/status', protect, updateStatus);
router.get('/:id', protect, getCandidate);
router.put('/:id', protect, updateCandidate);
router.delete('/:id', protect, deleteCandidate);

module.exports = router;
