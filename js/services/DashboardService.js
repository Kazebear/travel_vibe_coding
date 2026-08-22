import * as BookingRepository from '../repositories/BookingRepository.js';

export function getDashboardKpis() {
  return {
    monthlyTours: BookingRepository.getMonthlyTourCount(),
    flightCount: BookingRepository.getFlightCount(),
    tourCustomers: BookingRepository.getTourCustomerCount(),
    flightCustomers: BookingRepository.getFlightCustomerCount(),
  };
}

export function getTopAirlines(limit = 10) {
  return BookingRepository.getTopAirlines(limit);
}

export function getTopCountries(limit = 10) {
  return BookingRepository.getTopTourCountries(limit);
}
