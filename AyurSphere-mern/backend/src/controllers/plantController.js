import { Plant } from '../models/Plant.js';

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

  try {
    const plants = await Plant.find(filters).sort({ createdAt: -1 });
    return res.json(plants);
  } catch (err) {
    console.error('List plants error', err);
    return res.status(500).json({ message: 'Failed to load plants' });
  }
};

export const createPlant = async (req, res) => {
  const { plantName, scientificName, description, uses, imagePath, category } = req.body;

  if (!plantName || !scientificName) {
    return res.status(400).json({ message: 'Plant name and scientific name are required' });
  }

  try {
    const plant = await Plant.create({ plantName, scientificName, description, uses, imagePath, category });
    return res.status(201).json(plant);
  } catch (err) {
    console.error('Create plant error', err);
    return res.status(500).json({ message: 'Failed to create plant' });
  }
};
