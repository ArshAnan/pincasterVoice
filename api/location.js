const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// Define a schema for the location
const locationSchema = new mongoose.Schema({
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Create a model for the location
const Location = mongoose.model('Location', locationSchema);

// POST endpoint to save location
router.post('/', async (req, res) => {
    try {
        const { lat, lng } = req.body;

        if (!lat || !lng) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        const location = new Location({ lat, lng });
        await location.save();

        res.status(201).json({ message: 'Location saved successfully', location });
    } catch (error) {
        console.error('Error saving location:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
