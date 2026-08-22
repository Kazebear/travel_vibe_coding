import * as FlightRepository from '../repositories/FlightRepository.js';

export function searchFlights(filters) {
  return FlightRepository.searchFlights(filters);
}

export function getFlightById(id) {
  return FlightRepository.getFlightById(id);
}

export function getFlightsPage(page, pageSize) {
  return FlightRepository.getFlightsPage(page, pageSize);
}

export function countFlights() {
  return FlightRepository.countFlights();
}

export function createFlight(data) {
  return FlightRepository.createFlight(data);
}

export function updateFlight(id, data) {
  return FlightRepository.updateFlight(id, data);
}

export function deleteFlight(id) {
  return FlightRepository.deleteFlight(id);
}
