import express from 'express';
import { getCategories, getEvents, getEventById } from '../controllers/eventController.js';
import { getOccasionCollections, compareEvents } from '../controllers/aiController.js';
import { getOrCreateUser, getUserPreferences, updateUserPreferences, getSavedEvents, toggleSavedEvent } from '../controllers/userController.js';
import { createBooking, getBookings, cancelBooking } from '../controllers/bookingController.js';

const router = express.Router();

// Categories routes
router.get('/categories', getCategories);

// Events routes
router.get('/events', getEvents);
router.get('/events/:id', getEventById);

// AI Discover & Compare Corner routes
router.get('/ai/collections', getOccasionCollections);
router.post('/ai/compare', compareEvents);

// User profile & Preferences routes
router.post('/user/setup', getOrCreateUser);
router.get('/user/preferences', getUserPreferences);
router.post('/user/preferences', updateUserPreferences);
router.get('/user/saved', getSavedEvents);
router.post('/user/saved', toggleSavedEvent);

// Checkout Bookings routes
router.post('/bookings', createBooking);
router.get('/bookings', getBookings);
router.delete('/bookings/:id', cancelBooking);

export default router;
