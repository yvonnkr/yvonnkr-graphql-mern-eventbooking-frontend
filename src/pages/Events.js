import React, {
  useState,
  useRef,
  useContext,
  useEffect,
  useCallback
} from 'react';
import axios from 'axios';

import Modal from './../components/Modal/Modal';
import Backdrop from './../components/Backdrop/Backdrop';
import { AuthContext } from '../context/auth-context';
import './Events.css';

const Events = () => {
  const [creating, setCreating] = useState(false);
  const [events, setEvents] = useState([]);
  const titleRef = useRef();
  const priceRef = useRef();
  const dateRef = useRef();
  const descriptionRef = useRef();
  const auth = useContext(AuthContext);

  const startCreateEventHandler = () => {
    setCreating(true);
  };

  const modalConfirmHandler = async () => {
    setCreating(false);

    //form inputs
    const title = titleRef.current.value;
    const price = +priceRef.current.value;
    const date = dateRef.current.value;
    const description = descriptionRef.current.value;

    //basic input validation
    if (
      title.trim().length === 0 ||
      price <= 0 ||
      date.trim().length === 0 ||
      description.trim().length === 0
    ) {
      return;
    }

    //graphql query
    const reqBody = {
      query: `
        mutation {
          createEvent(eventInput: {title: "${title}", price: ${price}, date: "${date}", description: "${description}"}){
            _id
            title
            price
            date
            description
            creator {
              _id
              email
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

      console.log(response.data);
      await fetchEvents();
    } catch (err) {
      console.log(err);
    }
  };

  const modalCancelHandler = () => {
    setCreating(false);
  };

  const fetchEvents = useCallback(async () => {
    //graphql query
    const reqBody = {
      query: `
        query {
          events{
            _id
            title
            price
            date
            description
            creator {
              _id
              email
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
          'Content-Type': 'application/json'
        }
      });

      const fetchedEvents = response.data.data.events;
      setEvents(fetchedEvents);
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    const getEvents = async () => {
      await fetchEvents();
    };
    getEvents();
  }, [fetchEvents]);

  const eventList = events.map(event => {
    return (
      <li key={event._id} className='events__list-item'>
        {event.title}
      </li>
    );
  });

  return (
    <>
      {creating && (
        <>
          <Backdrop />
          <Modal
            title='Add Event'
            canCancel
            canConfirm
            onConfirm={modalConfirmHandler}
            onCancel={modalCancelHandler}
          >
            <form>
              <div className='form-control'>
                <label htmlFor='title'>Title</label>
                <input type='text' id='title' ref={titleRef} />
              </div>
              <div className='form-control'>
                <label htmlFor='price'>Price</label>
                <input type='number' id='price' ref={priceRef} />
              </div>
              <div className='form-control'>
                <label htmlFor='date'>Date</label>
                <input type='datetime-local' id='date' ref={dateRef} />
              </div>
              <div className='form-control'>
                <label htmlFor='description'>Description</label>
                <textarea id='description' rows='4' ref={descriptionRef} />
              </div>
            </form>
          </Modal>
        </>
      )}
      {auth.token && (
        <div className='events-control'>
          <p>Share your own events.</p>
          <button className='btn' onClick={startCreateEventHandler}>
            Create Event
          </button>
        </div>
      )}
      <ul className='events__list'>{eventList}</ul>
    </>
  );
};

export default Events;
