import React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isEmpty } from "../utils/index";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getPremiumEvents,
  getAllEvents,
  getOthersEvents,
} from "../../actions/event";

import dayjs from "dayjs";
import "dayjs/locale/fr";

const EventsBoard = () => {
  const dispatch = useDispatch();
  const allEvents = useSelector((state) => state.events);
  let events = useSelector((state) => state.premiumEvents);
  !isEmpty(events) &&
    events.sort((a, b) => {
      return b.createdAt.localeCompare(a.createdAt);
    });

  let otherEvents = useSelector((state) => state.othersEvent);
  !isEmpty(otherEvents) &&
    otherEvents.sort((a, b) => {
      return b.createdAt.localeCompare(a.createdAt);
    });
  const user = useSelector((state) => state.user.user);

  // Afficher / Cacher le formulaire
  const [toggleForm, setToggleForm] = useState(false);

  // Fichiers données
  const [files, setFiles] = useState([]);
  const [fileSet, setFileSet] = useState([]);

  const [isOk, setIsOk] = useState(false);
  const [count, setCount] = useState([1]);
  const [countHours, setCountHours] = useState([1, 2]);

  const [isSetForm, setIsSetForm] = useState(false);

  // Mode édition
  const [isEdit, setIsEdit] = useState(false);
  const [eventEdit, setEventEdit] = useState(false);

  const editEvent = (idx) => {
    setIsEdit(true);
    setCount([1]);
    const eventFound = allEvents.filter((e) => e._id === idx)[0];
    setEventEdit(eventFound);

    const begin = dayjs(allEvents.startAt).format("HH:mm");
    const end = dayjs(allEvents.endAt).format("HH:mm");

    let dateFound = [];
    eventFound?.dateEvent.forEach((el) => {
      dateFound.push(dayjs(el).format("YYYY-MM-DD"));
    });

    dateFound.length === 2 && setCount([1, 2]);


    setToggleForm(true);

    setFormData({
      poster: eventFound.poster,
      title: eventFound.title,
      description: eventFound.description,
      address: eventFound.address,
      begin: begin,
      end: end,
      startAt: eventFound.startAt,
      endAt: eventFound.endAt,
      dateEvent: eventFound.dateEvent,
      dateBegin: dateFound[0],
      dateEnd: dateFound.length > 1 && dateFound[1],
      organizer: eventFound.organizer,
      isPremium: eventFound.isPremium,
      posterId: eventFound.posterId,
    });

    files.length = 0;
    files.push(eventFound.poster);
  };

  const deleteEvents = async (idx) => {
    const eventFound = allEvents.filter((e) => e._id === idx)[0];
    const id = eventFound._id;

    var answer = window.confirm("Are you sure you want to delete this item?");
    if (answer) {
      await dispatch(deleteEvent(id))
        .then(() => {
          dispatch(getAllEvents());
          dispatch(getPremiumEvents());
          dispatch(getOthersEvents());
        })
        .catch(() => {});
    }
  };

  const [formData, setFormData] = useState({
    poster: "",
    title: "",
    description: "",
    address: "",
    begin: "00:00",
    end: "00:00",
    startAt: null,
    endAt: null,
    dateEvent: [],
    dateBegin: "2022-01-01",
    dateEnd: "2022-01-01",
    organizer: "",
    isPremium: false,
    posterId: user._id,
  });

  const submitForm = async (e) => {
    e.preventDefault();
    setIsOk(true);

    const data = new FormData();
    data.append("poster", formData.poster);
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("address", formData.address);
    data.append("startAt", formData.startAt);
    data.append("endAt", formData.endAt);
    data.append("dateEvent", formData.dateEvent);
    data.append("organizer", formData.organizer);
    data.append("isPremium", formData.isPremium);
    data.append("posterId", formData.posterId);

    isEdit
      ? await dispatch(updateEvent(eventEdit._id, data))
          .then(() => {
            setIsOk(false);
            dispatch(getPremiumEvents());
            dispatch(getOthersEvents());
            dispatch(getAllEvents());

            cancelForm();
            setToggleForm(!toggleForm);
            return true;
          })
          .catch((error) => {
          })
      : await dispatch(createEvent(data))
          .then(() => {
            setIsOk(false);
            dispatch(getPremiumEvents());
            dispatch(getOthersEvents());
            dispatch(getAllEvents());

            cancelForm();
            setToggleForm(!toggleForm);
            return true;
          })
          .catch((error) => {
        
          });

    setIsOk(false);
  };

  const cancelForm = () => {
    setFormData({
      poster: "",
      title: "",
      description: "",
      address: "",
      startAt: 1663570800,
      endAt: 1663570800,
      dateEvent: [],
      organizer: "",
      posterId: "",
    });
  };

  const renderHoursComponent = () => {
    let ele = document.querySelectorAll(".hourpicker-container");

    const valueByEl = (e) => {
      switch (e) {
        case 1:
          return formData?.begin;

        case 2:
          return formData?.end;
      }
    };

    const selectHour = (e, el) => {
      const [hours, minutes] = ele[0]?.childNodes[0]?.value.split(":");
      const hour1 = new Date("2022", "10", "10", hours, minutes);

      const [hours2, minutes2] = ele[1]?.childNodes[0]?.value.split(":");
      const hour2 = new Date("2022", "10", "10", hours2, minutes2);

      switch (e) {
        case 1:
          setFormData({
            ...formData,
            startAt: hour1,
            begin: el,
            endAt: hour2,
          });
          break;

        case 2:
          setFormData({
            ...formData,
            startAt: hour1,
            end: el,
            endAt: hour2,
          });
          break;
      }
    };

    return countHours.map((el) => (
      <div className="hourpicker-container">
        <input
          type="time"
          className="datepicker-input"
          value={valueByEl(el)}
          onChange={(e) => {
            selectHour(el, e.target.value);
          }}
        />
      </div>
    ));
  };

  useEffect(() => {
    setIsSetForm(true);

    if (isSetForm) {
      setFormData({
        ...formData,
      });
      setIsSetForm(false);
    }
  }, [formData]);

  useEffect(() => {
    dispatch(getPremiumEvents());
    dispatch(getOthersEvents());
    dispatch(getAllEvents());
  }, [dispatch]);

  const renderDatesComponent = () => {
    const datesElement = document.querySelectorAll(".datepicker-container");
    const selectDate = (idx, date) => {
      const date1 = new Date(datesElement[0]?.childNodes[0]?.value);
      const date2 = new Date(datesElement[1]?.childNodes[0]?.value);

      const arr = [];
      switch (count.length) {
        case 1:
          arr.push(date1);
          setFormData({
            ...formData,
            dateBegin: datesElement[0]?.childNodes[0]?.value,
            dateEvent: arr,
          });
          break;
        case 2:
          arr.push(date1);
          arr.push(date2);

          setFormData({
            ...formData,
            dateBegin: datesElement[0]?.childNodes[0]?.value,
            dateEnd: datesElement[1]?.childNodes[0]?.value,
            dateEvent: arr,
          });
          break;

        default:
          break;
      }
    };

    const dateValueByCount = (idx) => {
      return idx === 1 ? formData.dateBegin : formData.dateEnd;
    };

    return count.map((el) => (
      <div className="datepicker-container">
        <input
          type="date"
          className="datepicker-input"
          value={dateValueByCount(el)}
          onChange={(e) => selectDate(el, e.target.value)}
        />
      </div>
    ));
  };

  const plusButton = () => {
    const a = [1, 2];
    const element = (
      <div
        className="plus-button"
        onClick={() => {
          setFormData({
            ...formData,
          });
          setCount(a);
        }}
      >
        <img src={process.env.PUBLIC_URL + "/imgs/icons/plus.png"} alt="Plus" />
      </div>
    );
    switch (count.length) {
      case 1:
        return element;
        break;
      default:
        break;
    }
  };

  const fileSelectedHandler = (e) => {
    const filesParsed = URL.createObjectURL(e.target.files[0]);
    const filesSelected = e.target.files[0];

    setFiles([...files, filesParsed]);
    setFileSet([...fileSet, filesSelected]);
    setFormData({ ...formData, poster: filesSelected });
  };

  const removeBlock = (idx) => {
    let arr = [...fileSet];
    let newArr = [...files];
    arr.splice(idx, 1);
    newArr.splice(idx, 1);

    setFileSet(arr);
    setFiles(newArr);
    setFormData({ ...formData, poster: arr });
  };

  const renderFiles = () => {
    return files.map((e, idx) => {
      return (
        <div className="picture-block" key={idx}>
          <img src={e} alt={idx} />
          <div className="close-btn" onClick={() => removeBlock(idx)}>
            Supprimer
          </div>
        </div>
      );
    });
  };

  return (
    <>
      {toggleForm && (
        // Form elements
        <div className="form-container">
          <div className="form-group-container">
            <div className="container-header">
              <h1>Fiche Évènement</h1>

              <div
                className="form-closer"
                onClick={() => setToggleForm(!toggleForm)}
              >
                Fermer
              </div>
            </div>

            <div className="form-elements-container">
              <form onSubmit={(e) => submitForm(e)}>
                <div className="form-group">
                  <label htmlFor="title">Titre</label>
                  <input
                    htmlFor="title"
                    placeholder="Titre"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>
                <div className="form-group-group">
                  <div className="form-group">
                    <label htmlFor="address">Lieu</label>
                    <input
                      htmlFor="address"
                      placeholder="Lieu"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    htmlFor="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                {/** Date & Hour */}
                <div className="dates-group">
                  <h2>Date</h2>
                  {renderDatesComponent()}
                  {plusButton()}
                  <h2>Heure</h2>
                  {renderHoursComponent()}
                </div>

                {/** Organisateur */}
                <div className="form-group">
                  <label htmlFor="organizer">Organisateur</label>
                  <input
                    htmlFor="organizer"
                    placeholder="Organisateur"
                    value={formData.organizer}
                    onChange={(e) =>
                      setFormData({ ...formData, organizer: e.target.value })
                    }
                  />
                </div>

                {/** Picture */}
                <div className="pictures">
                  <div className="pictures-title">
                    <h3>Image</h3>
                  </div>
                  <div className="pictures-content">
                    <div className="pictures-blocks-container">
                      {!isEmpty(files) && <>{renderFiles()}</>}

                      {files.length < 1 && (
                        <div className="file-upload">
                          <input
                            type="file"
                            name="file"
                            onChange={(e) => fileSelectedHandler(e)}
                            accept=".jpg, .jpeg, .png"
                          />
                          <i className="fa fa-arrow-up"></i>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="btn-group">
                  <input type="submit" value="Save" />
                  {isOk === true && <i className="fa fa-spinner fa-spin"></i>}

                  <input
                    type="reset"
                    value="Annuler"
                    onClick={() => cancelForm()}
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <div className="events-board-container">
        <div className="header">
          <h1>Évènements</h1>
        </div>

        <div className="events-container">
          <h1>Évènements PREMIUM</h1>
          <div className="premium-events">
            <div
              className="event-add-element"
              onClick={() => {
                setToggleForm(!toggleForm);
                setFormData({ ...formData, isPremium: true });
              }}
            >
              <img
                src={process.env.PUBLIC_URL + "/imgs/icons/add.png"}
                alt={"add"}
              />
            </div>
            {!isEmpty(events) &&
              events.map((element, i) => (
                <div className="event-element" key={i}>
                  <div className="event-infos">
                    <div className="event-infos-image">
                      {element?.poster ? (
                        <img
                          src={process.env.PUBLIC_URL + element.poster}
                          alt={element.name}
                        />
                      ) : (
                        <img
                          src={process.env.PUBLIC_URL + "/imgs/icon.png"}
                          alt={element.name}
                        />
                      )}{" "}
                    </div>
                    <div className="event-infos-name">
                      <h4>{element.title}</h4>
                      <h6>{element.organizer}</h6>
                      <h6>{element.address}</h6>
                    </div>
                  </div>
                  <div className="event-element-footer">
                    <NavLink
                      to={`/event/${element._id}`}
                      className="footer-view"
                      target="_blank"
                    >
                      <img
                        src={process.env.PUBLIC_URL + "/imgs/icons/eye.png"}
                        alt={"eye"}
                      />
                    </NavLink>{" "}
                    <div
                      className="footer-edit"
                      onClick={() => editEvent(element._id)}
                    >
                      <img
                        src={process.env.PUBLIC_URL + "/imgs/icons/edit.png"}
                        alt={"edit"}
                      />
                    </div>
                    <div
                      className="footer-delete"
                      onClick={() => deleteEvents(element._id)}
                    >
                      <img
                        src={process.env.PUBLIC_URL + "/imgs/icons/trash.png"}
                        alt={"delete"}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <h1>Évènements SÉCONDAIRES</h1>

          <div className="others-events">
            <div
              className="event-add-element"
              onClick={() => {
                setToggleForm(!toggleForm);
                setFormData({ ...formData, isPremium: false });
              }}
            >
              <img
                src={process.env.PUBLIC_URL + "/imgs/icons/add.png"}
                alt={"add"}
              />
            </div>
            {!isEmpty(otherEvents) &&
              otherEvents.map((element, i) => (
                <div className="event-element" key={i}>
                  <div className="event-infos">
                    <div className="event-infos-image">
                      {element?.poster ? (
                        <img
                          src={process.env.PUBLIC_URL + element.poster}
                          alt={element.name}
                        />
                      ) : (
                        <img
                          src={process.env.PUBLIC_URL + "/imgs/icon.png"}
                          alt={element.name}
                        />
                      )}{" "}
                    </div>
                    <div className="event-infos-name">
                      <h4>{element.title}</h4>
                      <h6>{element.organizer}</h6>
                      <h6>{element.address}</h6>
                    </div>
                  </div>
                  <div className="event-element-footer">
                    <NavLink
                      to={`/event/${element._id}`}
                      className="footer-view"
                      target="_blank"
                    >
                      <img
                        src={process.env.PUBLIC_URL + "/imgs/icons/eye.png"}
                        alt={"edit"}
                      />
                    </NavLink>{" "}
                    <div
                      className="footer-edit"
                      onClick={() => editEvent(element._id)}
                    >
                      <img
                        src={process.env.PUBLIC_URL + "/imgs/icons/edit.png"}
                        alt={"edit"}
                      />
                    </div>
                    <div
                      className="footer-delete"
                      onClick={() => deleteEvents(element._id)}
                    >
                      <img
                        src={process.env.PUBLIC_URL + "/imgs/icons/trash.png"}
                        alt={"delete"}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default EventsBoard;
