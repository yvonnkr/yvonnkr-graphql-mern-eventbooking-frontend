import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';

import { AuthContext } from '../context/auth-context';
import Spinner from './../components/Spinner/Spinner';
import BookingList from '../components/Bookings/BookingList';
import BookingsChart from '../components/Bookings/BookingsChart';
import BookingsControls from '../components/Bookings/BookingsControls';

const Bookings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [outputType, setOutputType] = useState('list');

  const auth = useContext(AuthContext);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    //graphql query
    const reqBody = {
      query: `
        query {
          bookings {
            _id
            createdAt
            event {
              _id
              title
              date
              price
            }
          }
        }
      `
    };

    //ajax request
    try {
      const response = await axios({
        url: `${process.env.REACT_APP_BACKEND_URL}/graphql`,
        method: 'POST',
        data: reqBody,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`
        }
      });

      const fetchedBookings = response.data.data.bookings;
      if (isActive) {
        setBookings(fetchedBookings);
      }

      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  }, [auth.token, isActive]);

  useEffect(() => {
    const getBookings = async () => {
      await fetchBookings();
    };
    getBookings();

    //cleanup / equivalent to componentWillunmout
    return () => {
      setIsActive(false);
    };
  }, [fetchBookings]);

  const deleteBookingHandler = async bookingId => {
    setIsLoading(true);

    const reqBody = {
      query: `
          mutation CancelBooking($id: ID!) {
            cancelBooking(bookingId: $id) {
            _id
             title
            }
          }
        `,
      variables: {
        id: bookingId
      }
    };

    //ajax request
    try {
      await axios({
        url: `${process.env.REACT_APP_BACKEND_URL}/graphql`,
        method: 'POST',
        data: reqBody,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`
        }
      });

      const updatedBookings = bookings.filter(
        booking => booking._id !== bookingId
      );
      setBookings(updatedBookings);

      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  const changeOutputTypeHandler = outputType => {
    if (outputType === 'list') {
      setOutputType('list');
    } else {
      setOutputType('chart');
    }
  };

  let content = <Spinner />;

  if (!isLoading) {
    content = (
      <>
        <BookingsControls
          onChange={changeOutputTypeHandler}
          activeOutputType={outputType}
        />
        <div>
          {outputType === 'list' ? (
            <BookingList bookings={bookings} onDelete={deleteBookingHandler} />
          ) : (
            <BookingsChart bookings={bookings} />
          )}
        </div>
      </>
    );
  }

  return <>{content}</>;

  // return (
  //   <>
  //     {isLoading ? (
  //       <Spinner />
  //     ) : (
  //       <BookingList bookings={bookings} onDelete={deleteBookingHandler} />
  //     )}
  //   </>
  // );
};

export default Bookings;
