import React, { useState, useEffect } from 'react';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState(null);

  useEffect(() => {
    // Fetch bookings from an API or data source here
    const fetchedBookings = [
      { id: 1, customerName: 'John Doe', item: 'Room A', startDate: '2026-04-01', endDate: '2026-04-05', status: 'confirmed' },
      { id: 2, customerName: 'Jane Smith', item: 'Room B', startDate: '2026-04-10', endDate: '2026-04-12', status: 'pending' },
      { id: 3, customerName: 'Alice Brown', item: 'Room A', startDate: '2026-04-15', endDate: '2026-04-20', status: 'canceled' },
    ];
    setBookings(fetchedBookings);
  }, []);

  const sortedBookings = React.useMemo(() => {
    let sortableBookings = [...bookings];
    if (sortConfig !== null) {
      sortableBookings.sort((a, b) => {
        let order = 1;
        if (sortConfig.direction === 'descending') {
          order = -1;
        }
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return -1 * order;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return 1 * order;
        }
        return 0;
      });
    }
    return sortableBookings;
  }, [bookings, sortConfig]);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (
      sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div>
      <h1>Bookings Management</h1>
      <input
        type='text'
        placeholder='Filter by customer name'
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort('id')}>ID</th>
            <th onClick={() => handleSort('customerName')}>Customer Name</th>
            <th onClick={() => handleSort('item')}>Item</th>
            <th onClick={() => handleSort('startDate')}>Start Date</th>
            <th onClick={() => handleSort('endDate')}>End Date</th>
            <th onClick={() => handleSort('status')}>Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedBookings
            .filter((booking) =>
              booking.customerName.toLowerCase().includes(filter.toLowerCase())
            )
            .map((booking) => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{booking.customerName}</td>
                <td>{booking.item}</td>
                <td>{booking.startDate}</td>
                <td>{booking.endDate}</td>
                <td>{booking.status}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Bookings;
