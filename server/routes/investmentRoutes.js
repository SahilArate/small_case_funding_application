
const express = require('express');
const router = express.Router();
const Investment = require('../models/Investment');
const Project = require('../models/Project'); // Ensure Project model is imported

// Get all investments for admin (NOW UNPROTECTED)
router.get('/admin/all', async (req, res) => {
  try {
    const investments = await Investment.find()
      .populate('projectId', 'title amount location')
      .populate('investorId', 'name email')
      .sort({ createdAt: -1 });
    res.json(investments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching investments', error: error.message });
  }
});

// Admin approve/reject/review investment (NOW UNPROTECTED)
router.put('/admin/:id', async (req, res) => {
  try {
    const { action, rejectionReason } = req.body;

    let updateData = {};
    let investment;

    investment = await Investment.findById(req.params.id);
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    if (action === 'approve') {
      if (investment.status === 'Approved') {
        return res.status(400).json({ message: 'Investment is already approved.' });
      }

      updateData = {
        status: 'Approved',
        adminApprovedAt: new Date(),
        adminApprovedBy: 'Admin', // Hardcoded
        rejectionReason: null
      };

      const project = await Project.findById(investment.projectId);
      if (!project) {
        return res.status(404).json({ message: 'Associated project not found.' });
      }

      project.amountFunded += investment.amount;
      if (project.amountFunded >= project.amount) {
        project.status = 'Completed';
      }
      await project.save();

    } else if (action === 'reject') {
      if (!rejectionReason) {
        return res.status(400).json({ message: 'Rejection reason is required for rejection.' });
      }
      updateData = {
        status: 'Rejected',
        rejectionReason,
        adminApprovedAt: null,
        adminApprovedBy: null
      };
      
      if (investment.status === 'Approved') {
        const project = await Project.findById(investment.projectId);
        if (project) {
          project.amountFunded -= investment.amount;
          if (project.amountFunded < 0) project.amountFunded = 0;
          if (project.status === 'Completed' && project.amountFunded < project.amount) {
            project.status = 'In Progress';
          }
          await project.save();
        }
      }

    } else if (action === 'under review') {
      updateData = {
        status: 'Under Review',
        rejectionReason: null,
        adminApprovedAt: null,
        adminApprovedBy: null
      };
    } else {
      return res.status(400).json({ message: 'Invalid action. Must be "approve", "reject", or "under review".' });
    }

    const updatedInvestment = await Investment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedInvestment) {
      return res.status(404).json({ message: 'Investment not found after update attempt.' });
    }

    res.json({ success: true, message: 'Investment updated successfully', investment: updatedInvestment });
  } catch (error) {
    console.error('Error updating investment:', error);
    res.status(500).json({ message: 'Error updating investment', error: error.message });
  }
});

// Create new investment
router.post('/create', async (req, res) => {
  try {
    const investment = new Investment(req.body);
    await investment.save();
    res.status(201).json({ message: 'Investment created successfully', investment });
  } catch (error) {
    res.status(500).json({ message: 'Error creating investment', error: error.message });
  }
});

// Get investments by investor ID (NOW UNPROTECTED - relies only on investorId in URL)
router.get('/investor/:investorId', async (req, res) => {
  try {
    // WARNING: This route is now UNPROTECTED by JWT. Anyone can fetch investments
    // if they know the investorId.
    const investments = await Investment.find({ investorId: req.params.investorId })
      .populate('projectId', 'title amount location amountFunded status')
      .populate('investorId', 'name email')
      .sort({ createdAt: -1 });
    res.json(investments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching investments', error: error.message });
  }
});

// Get investments by project ID (NOW UNPROTECTED - relies only on projectId in URL)
router.get('/project/:projectId', async (req, res) => {
  try {

    const investments = await Investment.find({ projectId: req.params.projectId })
      .populate('investorId', 'name email')
      .sort({ createdAt: -1 });
    res.json(investments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching investments for project', error: error.message });
  }
});

module.exports = router;
