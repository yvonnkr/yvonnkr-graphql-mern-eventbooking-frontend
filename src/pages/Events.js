import React, {
  useState,
  useRef,
  useContext,
  useEffect,
  useCallback
} from 'react';
import axios from 'axios';

import { AuthContext } from '../context/auth-context';
import Modal from './../components/Modal/Modal';
import Backdrop from './../components/Backdrop/Backdrop';
import EventList from '../components/Events/EventList';
import Spinner from './../components/Spinner/Spinner';
import './Events.css';

const Events = () => {
  const [creating, setCreating] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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

      setEvents(prevState => {
        const {
          _id,
          title,
          price,
          date,
          description
        } = response.data.data.createEvent;

        const updatedEvents = [...prevState];

        updatedEvents.push({
          _id,
          title,
          price,
          date,
          description,
          creator: {
            _id: auth.userId
          }
        });

        return updatedEvents;
      });
    } catch (err) {
      console.log(err);
    }
  };

  const modalCancelHandler = () => {
    setCreating(false);
    setSelectedEvent(null);
  };

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const getEvents = async () => {
      await fetchEvents();
    };
    getEvents();
  }, [fetchEvents]);

  const showDetailHandler = eventId => {
    const selectedEv = events.find(e => e._id === eventId);
    setSelectedEvent(selectedEv);
  };

  const bookEventHandler = async () => {
    if (auth.token === null) {
      setSelectedEvent(null);
      return;
    }

    //graphql query
    const reqBody = {
      query: `
        mutation {
          bookEvent (eventId: "${selectedEvent._id}") {
             _id
            createdAt
            updatedAt
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
      setSelectedEvent(null);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      {creating || (selectedEvent && <Backdrop />)}
      {creating && (
        <>
          <Modal
            title='Add Event'
            canCancel
            canConfirm
            onConfirm={modalConfirmHandler}
            onCancel={modalCancelHandler}
            confimText='Confirm'
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

      {selectedEvent && (
        <>
          <Modal
            title={selectedEvent.title}
            canCancel
            canConfirm
            onCancel={modalCancelHandler}
            onConfirm={bookEventHandler}
            confimText={auth.token ? 'Book Event' : 'Confirm'}
          >
            <h1>{selectedEvent.title}</h1>
            <h2>
              ${selectedEvent.price} -{' '}
              {new Date(selectedEvent.date).toLocaleDateString()}
            </h2>
            <p>{selectedEvent.description}</p>
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

      {isLoading ? (
        <Spinner />
      ) : (
        <EventList
          events={events}
          authUserId={auth.userId}
          onViewDetail={showDetailHandler}
        />
      )}
    </>
  );
};

export default Events;
