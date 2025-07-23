
const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose'); // Add this for ObjectId validation

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Admin: Get all projects
router.get('/admin/all', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    console.log(`📊 Fetched ${projects.length} projects for admin`);
    res.json(projects);
  } catch (error) {
    console.error('💥 Error fetching all admin projects:', error);
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
});

// Admin approves or rejects a project
router.put('/admin/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    
    // Validate ObjectId
    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID format' });
    }

    const { action, rejectionReason } = req.body;

    let updateData = {};
    if (action === 'approve') {
      updateData = {
        adminStatus: 'Approved',
        adminReviewedAt: new Date(),
        adminReviewedBy: 'Admin'
      };
    } else if (action === 'reject') {
      updateData = {
        adminStatus: 'Rejected',
        rejectionReason,
        adminReviewedAt: new Date(),
        adminReviewedBy: 'Admin'
      };
    } else {
      return res.status(400).json({ message: 'Invalid action. Must be "approve" or "reject".' });
    }

    const project = await Project.findByIdAndUpdate(projectId, updateData, { new: true });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    console.log(`✅ Project ${action}d: ${project.title}`);
    res.json({ success: true, message: `Project ${action}d successfully`, project });
  } catch (error) {
    console.error('💥 Error updating project status by admin:', error);
    res.status(500).json({ message: 'Error updating project status', error: error.message });
  }
});

// Get all projects (public dashboard - only approved and not fully funded)
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({ 
      adminStatus: 'Approved',
      $where: 'this.amountFunded < this.amount'
    }).sort({ createdAt: -1 });
    
    console.log(`📊 Fetched ${projects.length} public projects`);
    res.json(projects);
  } catch (error) {
    console.error('💥 Error fetching public projects:', error);
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
});

// Get single project by ID
router.get('/project/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    
    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID format' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    console.log(`✅ Fetched project: ${project.title}`);
    res.json(project);
  } catch (error) {
    console.error('💥 Error fetching single project:', error);
    res.status(500).json({ message: 'Error fetching project details', error: error.message });
  }
});

// Get approved projects for investors
router.get('/investor/approved', async (req, res) => {
  try {
    const approvedProjects = await Project.find({ 
      adminStatus: 'Approved'
    }).sort({ createdAt: -1 });
    
    console.log(`📊 Fetched ${approvedProjects.length} approved projects for investor`);
    res.json(approvedProjects);
  } catch (error) {
    console.error('💥 Error fetching approved projects for investor:', error);
    res.status(500).json({ message: 'Error fetching approved projects', error: error.message });
  }
});

// Get projects by owner ID - FIXED: Validate ownerId
router.get('/owner/:ownerId', async (req, res) => {
  try {
    const ownerId = req.params.ownerId;
    console.log(`🔍 Fetching projects for owner ID: ${ownerId}`);
    
    if (!isValidObjectId(ownerId)) {
      console.log(`❌ Invalid owner ID format: ${ownerId}`);
      return res.status(400).json({ message: 'Invalid owner ID format' });
    }

    const projects = await Project.find({ ownerId }).sort({ createdAt: -1 });
    console.log(`📊 Found ${projects.length} projects for owner ${ownerId}`);
    res.json(projects);
  } catch (error) {
    console.error('💥 Error fetching owner projects:', error);
    res.status(500).json({ message: 'Error fetching owner projects', error: error.message });
  }
});

// Create new project - ENHANCED: Better logging and validation
router.post('/create', upload.single('document'), async (req, res) => {
  try {
    console.log('📝 Creating new project...');
    console.log('📦 Request body:', req.body);
    console.log('📎 File:', req.file ? req.file.filename : 'No file uploaded');

    // Validate required fields
    const { title, description, amount, location, deadline, ownerId } = req.body;

    if (!title || !description || !amount || !location || !deadline) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        message: 'Missing required fields: title, description, amount, location, deadline' 
      });
    }

    if (!ownerId) {
      console.log('❌ Missing ownerId');
      return res.status(400).json({ message: 'Owner ID is required' });
    }

    // Validate ownerId format
    if (!isValidObjectId(ownerId)) {
      console.log(`❌ Invalid ownerId format: ${ownerId}`);
      return res.status(400).json({ message: 'Invalid owner ID format' });
    }

    // Validate amount
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      console.log(`❌ Invalid amount: ${amount}`);
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    // Validate deadline
    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      console.log(`❌ Invalid deadline: ${deadline}`);
      return res.status(400).json({ message: 'Deadline must be in the future' });
    }

    const projectData = {
      title: title.trim(),
      description: description.trim(),
      amount: numAmount,
      location: location.trim(),
      deadline: deadlineDate,
      status: req.body.status || 'Pending',
      priority: req.body.priority || 'Medium',
      engineer: req.body.engineer ? req.body.engineer.trim() : '',
      ownerId: ownerId,
      document: req.file ? req.file.path : null,
      amountFunded: 0,
      adminStatus: 'Pending' // Add this field
    };

    console.log('✅ Validated project data:', {
      title: projectData.title,
      ownerId: projectData.ownerId,
      amount: projectData.amount
    });

    const project = new Project(projectData);
    await project.save();

    console.log(`🎉 Project created successfully: ${project.title} (ID: ${project._id})`);
    res.status(201).json({ 
      message: 'Project created successfully', 
      project: {
        ...project.toObject(),
        id: project._id.toString() // Include both _id and id for consistency
      }
    });
  } catch (error) {
    console.error('💥 Error creating project:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: messages 
      });
    }
    
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
});

// Update project status
router.patch('/status/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    
    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID format' });
    }

    const { status, rejectionReason } = req.body;
    const updateData = { status };

    if (status === 'Rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    if (status === 'Approved') {
      updateData.approvedAt = new Date();
    }

    const project = await Project.findByIdAndUpdate(projectId, updateData, { new: true });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    console.log(`✅ Project status updated: ${project.title} -> ${status}`);
    res.json({ message: 'Project status updated successfully', project });
  } catch (error) {
    console.error('💥 Error updating project general status:', error);
    res.status(500).json({ message: 'Error updating project status', error: error.message });
  }
});

// Route to update fund utilization notes for a project
router.patch('/notes/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    
    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID format' });
    }

    const { fundUtilizationNotes } = req.body;
    const project = await Project.findByIdAndUpdate(
      projectId,
      { fundUtilizationNotes },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    console.log(`✅ Fund utilization notes updated for: ${project.title}`);
    res.json({ success: true, message: 'Fund utilization notes updated successfully', project });
  } catch (error) {
    console.error('💥 Error updating fund utilization notes:', error);
    res.status(500).json({ message: 'Error updating fund utilization notes', error: error.message });
  }
});

// Route to update fund utilization details for a project
router.patch('/fund-details/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    
    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID format' });
    }

    const { fundUtilizationDetails } = req.body;

    console.log(`[Backend Debug] PATCH /fund-details/${projectId} received.`);
    console.log('[Backend Debug] Received fundUtilizationDetails:', JSON.stringify(fundUtilizationDetails, null, 2));

    if (!Array.isArray(fundUtilizationDetails)) {
      console.log('[Backend Debug] Validation Error: fundUtilizationDetails is not an array.');
      return res.status(400).json({ message: 'fundUtilizationDetails must be an array.' });
    }

    // Validate each entry in the array
    for (const detail of fundUtilizationDetails) {
      if (typeof detail.amount !== 'number' || isNaN(detail.amount) || detail.amount < 0) {
        console.log(`[Backend Debug] Validation Error: Invalid amount found: ${detail.amount}`);
        return res.status(400).json({ message: 'Each fund utilization entry must have a valid non-negative amount.' });
      }
      if (typeof detail.description !== 'string' || detail.description.trim() === '') {
        console.log(`[Backend Debug] Validation Error: Empty description found for amount: ${detail.amount}`);
        return res.status(400).json({ message: 'Each fund utilization entry must have a non-empty description.' });
      }
    }

    const project = await Project.findByIdAndUpdate(
      projectId,
      { fundUtilizationDetails },
      { new: true, runValidators: true }
    );

    if (!project) {
      console.log(`[Backend Debug] Project with ID ${projectId} not found.`);
      return res.status(404).json({ message: 'Project not found' });
    }

    console.log('[Backend Debug] Fund utilization details updated successfully.');
    res.json({ success: true, message: 'Fund utilization details updated successfully', project });
  } catch (error) {
    console.error('[Backend Debug] Error updating fund utilization details:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.error('[Backend Debug] Mongoose Validation Errors:', messages);
      return res.status(400).json({ message: 'Validation error', errors: messages });
    }
    res.status(500).json({ message: 'Error updating fund utilization details', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    
    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID format' });
    }

    const project = await Project.findByIdAndDelete(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    console.log(`🗑️ Project deleted: ${project.title}`);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('💥 Error deleting project:', error);
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
});

router.put('/:id', upload.single('document'), async (req, res) => {
  try {
    const projectId = req.params.id;
    
    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID format' });
    }

    const updateData = { ...req.body };

    if (req.file) {
      updateData.document = req.file.path;
    }

    const project = await Project.findByIdAndUpdate(projectId, updateData, { new: true });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    console.log(`✅ Project updated: ${project.title}`);
    res.json({ message: 'Project updated successfully', project });
  } catch (error) {
    console.error('💥 Error updating project:', error);
    res.status(500).json({ message: 'Error updating project', error: error.message });
  }
});

module.exports = router;