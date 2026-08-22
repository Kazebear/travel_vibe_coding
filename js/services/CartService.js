import { getState, setCart } from '../state.js';

export function getCart() {
  return getState().cart;
}

export function addFlightToCart(flight, fareClass) {
  const cart = getCart();
  const price = fareClass === 'business' ? flight.business_price : flight.economy_price;
  const item = {
    flightId: flight.id,
    airline: flight.airline_name,
    flightNumber: flight.flight_number,
    origin: flight.origin_code,
    destination: flight.destination_code,
    date: flight.departure_date,
    departureTime: flight.departure_time,
    fareClass,
    price,
  };
  setCart({ ...cart, flights: [...cart.flights, item] });
}

export function addTourToCart(tour) {
  const cart = getCart();
  const item = {
    tourId: tour.id,
    name: tour.name,
    destination: tour.destination,
    date: tour.departure_date,
    days: tour.days,
    nights: tour.nights,
    price: tour.price,
  };
  setCart({ ...cart, tours: [...cart.tours, item] });
}

export function removeFlightFromCart(index) {
  const cart = getCart();
  setCart({ ...cart, flights: cart.flights.filter((_, i) => i !== index) });
}

export function removeTourFromCart(index) {
  const cart = getCart();
  setCart({ ...cart, tours: cart.tours.filter((_, i) => i !== index) });
}

export function clearCart() {
  setCart({ flights: [], tours: [] });
}

export function getCartTotal() {
  const cart = getCart();
  const flightTotal = cart.flights.reduce((sum, f) => sum + f.price, 0);
  const tourTotal = cart.tours.reduce((sum, t) => sum + t.price, 0);
  return flightTotal + tourTotal;
}

export function getCartCount() {
  const cart = getCart();
  return cart.flights.length + cart.tours.length;
}

export function isCartEmpty() {
  return getCartCount() === 0;
}
