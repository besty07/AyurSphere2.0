import { Plant } from '../models/Plant.js';

export const getPlantById = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }
    return res.json(plant);
  } catch (err) {
    console.error('Get plant error', err);
    return res.status(500).json({ message: 'Failed to load plant' });
  }
};

export const listPlants = async (req, res) => {
  const { search, category } = req.query;
  const filters = {};

  if (search) {
    filters.$or = [
      { plantName: { $regex: search, $options: 'i' } },
      { scientificName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  if (category && category !== 'all') {
    filters.category = category;
  }

  // If not admin, only show approved plants
  if (!req.user || req.user.role !== 'admin') {
    filters.status = 'Approved';
  }

  try {
    const plants = await Plant.find(filters).sort({ createdAt: -1 });
    return res.json(plants);
  } catch (err) {
    console.error('List plants error', err);
    return res.status(500).json({ message: 'Failed to load plants' });
  }
};

export const createPlant = async (req, res) => {
  const {
    plantName, scientificName, description, uses, imagePath, category,
    aka, overview, diseases, partsUsed, usageMethods, ayurvedicProfile
  } = req.body;

  if (!plantName || !scientificName) {
    return res.status(400).json({ message: 'Plant name and scientific name are required' });
  }

  try {
    const plant = await Plant.create({
      plantName, scientificName, description, uses, imagePath, category,
      aka: aka || '',
      overview: overview || [],
      diseases: diseases || [],
      partsUsed: partsUsed || [],
      usageMethods: usageMethods || [],
      ayurvedicProfile: ayurvedicProfile || {},
      status: req.user.role === 'admin' ? 'Approved' : 'Pending',
      submittedBy: req.user.id
    });
    return res.status(201).json(plant);
  } catch (err) {
    console.error('Create plant error', err);
    return res.status(500).json({ message: 'Failed to create plant' });
  }
};

export const updatePlant = async (req, res) => {
  try {
    const plant = await Plant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plant) return res.status(404).json({ message: 'Plant not found' });
    return res.json(plant);
  } catch (err) {
    console.error('Update plant error', err);
    return res.status(500).json({ message: 'Failed to update plant' });
  }
};

export const deletePlant = async (req, res) => {
  try {
    const plant = await Plant.findByIdAndDelete(req.params.id);
    if (!plant) return res.status(404).json({ message: 'Plant not found' });
    return res.json({ message: 'Plant deleted successfully' });
  } catch (err) {
    console.error('Delete plant error', err);
    return res.status(500).json({ message: 'Failed to delete plant' });
  }
};
