import * as BookingRepository from '../repositories/BookingRepository.js';

export async function getDashboardKpis() {
  const [monthlyTours, flightCount, tourCustomers, flightCustomers] = await Promise.all([
    BookingRepository.getMonthlyTourCount(),
    BookingRepository.getFlightCount(),
    BookingRepository.getTourCustomerCount(),
    BookingRepository.getFlightCustomerCount(),
  ]);
  return { monthlyTours, flightCount, tourCustomers, flightCustomers };
}

export function getTopAirlines(limit = 10) {
  return BookingRepository.getTopAirlines(limit);
}

export function getTopCountries(limit = 10) {
  return BookingRepository.getTopTourCountries(limit);
}
