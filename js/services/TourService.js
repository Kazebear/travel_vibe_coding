import * as TourRepository from '../repositories/TourRepository.js';

export function getFeaturedTours(limit = 8) {
  return TourRepository.getFeaturedTours(limit);
}

export function getTourById(id) {
  return TourRepository.getTourById(id);
}

export function getTourItinerary(tourId) {
  return TourRepository.getTourItinerary(tourId);
}

export function searchTours(filters) {
  return TourRepository.searchTours(filters);
}

export function getToursPage(page, pageSize) {
  return TourRepository.getToursPage(page, pageSize);
}

export function countTours() {
  return TourRepository.countTours();
}

export function getDistinctOperators() {
  return TourRepository.getDistinctOperators();
}

export function createTour(data, itineraryDays) {
  return TourRepository.createTour(data, itineraryDays);
}

export function updateTour(id, data, itineraryDays) {
  return TourRepository.updateTour(id, data, itineraryDays);
}

export function deleteTour(id) {
  return TourRepository.deleteTour(id);
}
