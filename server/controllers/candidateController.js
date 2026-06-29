const Candidate = require('../models/Candidate');

// GET all candidates
exports.getCandidates = async (req, res) => {
  try {
    const { dept, status, search } = req.query;
    const filter = {};
    if (dept && dept !== 'All') filter.dept = dept;
    if (status && status !== 'All') filter.status = status;
    if (search) {
      filter.$or = [
        { firstName:  { $regex: search, $options: 'i' } },
        { middleName: { $regex: search, $options: 'i' } },
        { lastName:   { $regex: search, $options: 'i' } },
      ];
    }
    const candidates = await Candidate.find(filter).sort({ createdAt: -1 });
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET single candidate
exports.getCandidate = async (req, res) => {
  try {
    const c = await Candidate.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Candidate not found' });
    res.json(c);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST create candidate
exports.createCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.create(req.body);
    res.status(201).json(candidate);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// POST bulk create
exports.bulkCreateCandidates = async (req, res) => {
  try {
    const docs = req.body;
    if (!Array.isArray(docs) || docs.length === 0)
      return res.status(400).json({ message: 'Provide an array of candidates' });

    // Ensure required fields have fallbacks
    const sanitized = docs.map(d => ({
      ...d,
      firstName: (d.firstName || '').toString().trim() || 'UNKNOWN',
      lastName:  (d.lastName  || '').toString().trim() || '',
      sex:       ['Male','Female'].includes(d.sex) ? d.sex : 'Male',
      dept:      d.dept || 'WEB DEVELOPMENT AND DATABASE ADMINSTRATION',
      status:    d.status || 'Registered',
    }));

    const result = await Candidate.insertMany(sanitized, { ordered: false });
    res.status(201).json({ inserted: result.length, data: result });
  } catch (err) {
    // insertMany with ordered:false may partially succeed
    if (err.insertedDocs && err.insertedDocs.length > 0) {
      return res.status(201).json({ inserted: err.insertedDocs.length, data: err.insertedDocs });
    }
    res.status(400).json({ message: err.message });
  }
};

// PUT update candidate
exports.updateCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    Object.assign(candidate, req.body);

    // Auto-set UCs when Competent
    if (req.body.status === 'Competent') {
      candidate.unitsOfCompetency = { uc1: true, uc2: true, uc3: true, uc4: true, uc5: true };
      candidate.failType = '';
    }
    if (req.body.status && req.body.status !== 'Non-Competent') {
      candidate.failType = '';
    }

    const updated = await candidate.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PATCH status only
exports.updateStatus = async (req, res) => {
  try {
    const { status, failType } = req.body;
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    candidate.status = status;
    if (status === 'Competent') {
      candidate.unitsOfCompetency = { uc1: true, uc2: true, uc3: true, uc4: true, uc5: true };
      candidate.failType = '';
    } else if (status === 'Non-Competent') {
      candidate.failType = failType || '';
    } else {
      candidate.failType = '';
    }

    const updated = await candidate.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PATCH bulk status update
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, status, failType } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ message: 'Provide ids array' });

    const updateData = { status };
    if (status === 'Competent') {
      updateData.unitsOfCompetency = { uc1: true, uc2: true, uc3: true, uc4: true, uc5: true };
      updateData.failType = '';
    } else if (status === 'Non-Competent') {
      updateData.failType = failType || '';
    } else {
      updateData.failType = '';
    }

    await Candidate.updateMany({ _id: { $in: ids } }, { $set: updateData });
    const updated = await Candidate.find({ _id: { $in: ids } });
    res.json({ updated: updated.length, data: updated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE candidate
exports.deleteCandidate = async (req, res) => {
  try {
    const c = await Candidate.findByIdAndDelete(req.params.id);
    if (!c) return res.status(404).json({ message: 'Candidate not found' });
    res.json({ message: 'Candidate deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [total, assessed, competent, nonCompetent, byDept] = await Promise.all([
      Candidate.countDocuments(),
      Candidate.countDocuments({ status: { $in: ['Assessed', 'Competent', 'Non-Competent'] } }),
      Candidate.countDocuments({ status: 'Competent' }),
      Candidate.countDocuments({ status: 'Non-Competent' }),
      Candidate.aggregate([
        {
          $group: {
            _id: '$dept',
            registered:   { $sum: 1 },
            assessed:     { $sum: { $cond: [{ $in: ['$status', ['Assessed', 'Competent', 'Non-Competent']] }, 1, 0] } },
            competent:    { $sum: { $cond: [{ $eq: ['$status', 'Competent'] }, 1, 0] } },
            nonCompetent: { $sum: { $cond: [{ $eq: ['$status', 'Non-Competent'] }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({ total, assessed, competent, nonCompetent, byDept });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
