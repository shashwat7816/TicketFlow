const axios = require('axios');
const API_URL = 'http://localhost:4000/api';

async function run() {
    try {
        console.log('1. Registering user...');
        const email = `test${Date.now()}@example.com`;
        const { data: auth } = await axios.post(`${API_URL}/auth/register`, {
            email,
            password: 'password123',
            name: 'Test User'
        });
        const token = auth.accessToken;
        console.log('   User registered:', auth.user.email);

        const config = { headers: { Authorization: `Bearer ${token}` } };

        console.log('2. Creating Event...');
        const { data: event } = await axios.post(`${API_URL}/events`, {
            name: 'Test Event ' + Date.now(),
            description: 'Test Desc',
            venue: 'Test Venue',
            date: new Date().toISOString(),
            eventType: 'seated',
            capacity: 20
        }, config);
        console.log('   Event created:', event.name, event._id);

        console.log('3. Fetching Seats...');
        const { data: seats } = await axios.get(`${API_URL}/events/${event._id}/seating`);
        const available = seats.filter(s => s.status === 'available');
        const seatToBook = available[0].seatId;
        console.log('   Booking seat:', seatToBook);

        console.log('4. Reserving Seat...');
        const { data: reservation } = await axios.post(`${API_URL}/reservations`, {
            eventId: event._id,
            seatIds: [seatToBook],
            holdSeconds: 60
        }, config); // PASSING TOKEN HERE is crucial after my fix
        console.log('   Reservation created:', reservation.reservationId);

        console.log('5. Checkout (Create Order)...');
        const { data: order } = await axios.post(`${API_URL}/orders`, {
            reservationId: reservation.reservationId
        }, config);
        console.log('   Order created:', order.orderId);

        console.log('6. Checking My Tickets...');
        const { data: myOrders } = await axios.get(`${API_URL}/orders/mine`, config);
        console.log('   My Orders count:', myOrders.length);

        const found = myOrders.find(o => o._id === order.orderId || (o.tickets && o.tickets.some(t => t.seatId === seatToBook)));

        if (found) {
            console.log('SUCCESS: Ticket found in user history!');
        } else {
            console.error('FAILURE: Ticket NOT found in user history.');
            process.exit(1);
        }

    } catch (e) {
        console.error('ERROR:', e.response?.data || e.message);
        process.exit(1);
    }
}

run();
