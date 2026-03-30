import { Favorite } from '../models/Favorite.js';
import { Plant } from '../models/Plant.js';

export const listFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id })
      .sort({ addedAt: -1 })
      .populate('plant');

    const plants = favorites.map((fav) => ({
      ...fav.plant.toObject(),
      favoriteId: fav._id,
      addedAt: fav.addedAt,
    }));

    return res.json(plants);
  } catch (err) {
    console.error('List favorites error', err);
    return res.status(500).json({ message: 'Failed to load favorites' });
  }
};

export const addFavorite = async (req, res) => {
  const { plantId } = req.body;
  if (!plantId) {
    return res.status(400).json({ message: 'plantId is required' });
  }

  try {
    const plant = await Plant.findById(plantId);
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    const favorite = await Favorite.findOneAndUpdate(
      { user: req.user.id, plant: plantId },
      {},
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({
      message: 'Added to favorites',
      favoriteId: favorite._id,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(200).json({ message: 'Already in favorites' });
    }
    console.error('Add favorite error', err);
    return res.status(500).json({ message: 'Failed to add favorite' });
  }
};

export const removeFavorite = async (req, res) => {
  const { plantId } = req.params;

  try {
    const result = await Favorite.findOneAndDelete({ user: req.user.id, plant: plantId });
    if (!result) {
      return res.status(404).json({ message: 'Favorite not found' });
    }
    return res.json({ message: 'Removed from favorites' });
  } catch (err) {
    console.error('Remove favorite error', err);
    return res.status(500).json({ message: 'Failed to remove favorite' });
  }
};
